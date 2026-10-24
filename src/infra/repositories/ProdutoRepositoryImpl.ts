import { asc, eq, inArray } from "drizzle-orm";
import { ProdutoRepository } from "../../application/repositories/ProdutoRepository";
import { ProdutoQuimico } from "../../domain/entities/ProdutoQuimico";
import { ClasseRisco } from "../../domain/enums/ClasseRisco";
import { StatusProduto } from "../../domain/enums/StatusProduto";
import { DomainError } from "../../domain/errors/DomainError";
import { db, DbExecutor } from "../database";
import {
    classeRisco,
    grupoCompatibilidade,
    produtoGrupoCompatibilidade,
    produtoQuimico,
} from "../database/schema";

async function obterClasseRiscoId(
    ex: DbExecutor,
    classe: ClasseRisco,
): Promise<string> {
    const [existente] = await ex
        .select({ id: classeRisco.id })
        .from(classeRisco)
        .where(eq(classeRisco.classe, classe))
        .limit(1);
    if (existente) return existente.id;

    const [nova] = await ex
        .insert(classeRisco)
        .values({ classe })
        .returning({ id: classeRisco.id });
    return nova.id;
}

const UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Converte uma referência de grupo no id do grupo:
 * - id (UUID): o grupo precisa existir;
 * - código (ex.: "G1"): usa o grupo com esse código ou cria um novo.
 */
async function obterGrupoId(ex: DbExecutor, referencia: string): Promise<string> {
    if (UUID_REGEX.test(referencia)) {
        const [existente] = await ex
            .select({ id: grupoCompatibilidade.id })
            .from(grupoCompatibilidade)
            .where(eq(grupoCompatibilidade.id, referencia))
            .limit(1);
        if (!existente) {
            throw new DomainError(
                "GRUPO_COMPATIBILIDADE_NAO_ENCONTRADO",
                `Grupo de compatibilidade não encontrado: ${referencia}.`,
            );
        }
        return existente.id;
    }

    const [existente] = await ex
        .select({ id: grupoCompatibilidade.id })
        .from(grupoCompatibilidade)
        .where(eq(grupoCompatibilidade.grupo, referencia))
        .limit(1);
    if (existente) return existente.id;

    const [novo] = await ex
        .insert(grupoCompatibilidade)
        .values({ grupo: referencia })
        .returning({ id: grupoCompatibilidade.id });
    return novo.id;
}

/** Substitui os grupos de compatibilidade vinculados ao produto. */
async function vincularGrupos(
    ex: DbExecutor,
    produtoId: string,
    referencias: string[],
): Promise<void> {
    const grupoIds: string[] = [];
    for (const referencia of referencias) {
        const grupoId = await obterGrupoId(ex, referencia);
        if (!grupoIds.includes(grupoId)) grupoIds.push(grupoId);
    }

    await ex
        .delete(produtoGrupoCompatibilidade)
        .where(eq(produtoGrupoCompatibilidade.produtoId, produtoId));
    if (grupoIds.length === 0) return;

    await ex.insert(produtoGrupoCompatibilidade).values(
        grupoIds.map((grupoCompatibilidadeId) => ({
            produtoId,
            grupoCompatibilidadeId,
        })),
    );
}

function consultarProdutos() {
    return db
        .select({ produto: produtoQuimico, classe: classeRisco.classe })
        .from(produtoQuimico)
        .innerJoin(
            classeRisco,
            eq(produtoQuimico.classeRiscoId, classeRisco.id),
        );
}

type LinhaProduto = Awaited<ReturnType<typeof consultarProdutos>>[number];

/**
 * Busca, via produto_grupo_compatibilidade, os códigos dos grupos de cada
 * produto informado e devolve um Map produtoId -> grupos. Uma consulta só.
 */
async function buscarGruposDosProdutos(
    produtoIds: string[],
): Promise<Map<string, string[]>> {
    const gruposPorProduto = new Map<string, string[]>();
    if (produtoIds.length === 0) return gruposPorProduto;

    const linhas = await db
        .select({
            produtoId: produtoGrupoCompatibilidade.produtoId,
            grupo: grupoCompatibilidade.grupo,
        })
        .from(produtoGrupoCompatibilidade)
        .innerJoin(
            grupoCompatibilidade,
            eq(
                produtoGrupoCompatibilidade.grupoCompatibilidadeId,
                grupoCompatibilidade.id,
            ),
        )
        .where(inArray(produtoGrupoCompatibilidade.produtoId, produtoIds))
        .orderBy(asc(produtoGrupoCompatibilidade.createdAt));

    for (const { produtoId, grupo } of linhas) {
        const grupos = gruposPorProduto.get(produtoId) ?? [];
        grupos.push(grupo);
        gruposPorProduto.set(produtoId, grupos);
    }
    return gruposPorProduto;
}

async function paraEntidades(linhas: LinhaProduto[]): Promise<ProdutoQuimico[]> {
    const gruposPorProduto = await buscarGruposDosProdutos(
        linhas.map(({ produto }) => produto.id),
    );
    return linhas.map((linha) =>
        paraEntidade(linha, gruposPorProduto.get(linha.produto.id) ?? []),
    );
}

function paraEntidade(
    { produto, classe }: LinhaProduto,
    gruposCompatibilidade: string[],
): ProdutoQuimico {
    return ProdutoQuimico.reidratar({
        id: produto.id,
        nome: produto.nome,
        descricao: produto.descricao ?? undefined,
        numeroONU: produto.numeroOnu ?? "",
        classeRisco: classe as ClasseRisco,
        gruposCompatibilidade,
        status: produto.status as StatusProduto,
        createdAt: produto.createdAt,
        updatedAt: produto.updatedAt,
    });
}

export class ProdutoRepositoryImpl implements ProdutoRepository {
    async criar(produto: ProdutoQuimico): Promise<ProdutoQuimico> {
        await db.transaction(async (tx) => {
            const classeRiscoId = await obterClasseRiscoId(
                tx,
                produto.classeRisco,
            );
            await tx.insert(produtoQuimico).values({
                id: produto.id,
                classeRiscoId,
                nome: produto.nome,
                descricao: produto.descricao,
                numeroOnu: produto.numeroONU,
                status: produto.status,
                createdAt: produto.createdAt,
                updatedAt: produto.updatedAt,
            });
            await vincularGrupos(
                tx,
                produto.id,
                produto.gruposCompatibilidade,
            );
        });

        // Relê do banco para a resposta trazer os códigos dos grupos (mesmo se vieram ids).
        return (await this.buscarPorId(produto.id)) ?? produto;
    }

    async buscarPorId(id: string): Promise<ProdutoQuimico | null> {
        const linhas = await consultarProdutos()
            .where(eq(produtoQuimico.id, id))
            .limit(1);
        const [produto] = await paraEntidades(linhas);
        return produto ?? null;
    }

    async listar(): Promise<ProdutoQuimico[]> {
        const linhas = await consultarProdutos().orderBy(
            asc(produtoQuimico.createdAt),
        );
        return paraEntidades(linhas);
    }

    async atualizar(
        id: string,
        dados: Partial<ProdutoQuimico>,
    ): Promise<ProdutoQuimico> {
        await db.transaction(async (tx) => {
            const classeRiscoId =
                dados.classeRisco !== undefined
                    ? await obterClasseRiscoId(tx, dados.classeRisco)
                    : undefined;

            await tx
                .update(produtoQuimico)
                .set({
                    nome: dados.nome?.trim(),
                    descricao: dados.descricao,
                    classeRiscoId,
                    updatedAt: new Date(),
                })
                .where(eq(produtoQuimico.id, id));

            if (dados.gruposCompatibilidade !== undefined) {
                await vincularGrupos(
                    tx,
                    id,
                    [...new Set(dados.gruposCompatibilidade)],
                );
            }
        });

        const atualizado = await this.buscarPorId(id);
        if (!atualizado) {
            throw new DomainError(
                "PRODUTO_NAO_ENCONTRADO",
                "Produto químico não encontrado.",
            );
        }
        return atualizado;
    }

    async inativar(id: string): Promise<void> {
        await db
            .update(produtoQuimico)
            .set({ status: StatusProduto.INATIVO, updatedAt: new Date() })
            .where(eq(produtoQuimico.id, id));
    }
}
