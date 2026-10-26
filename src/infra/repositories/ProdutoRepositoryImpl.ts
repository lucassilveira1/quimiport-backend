import { asc, eq, inArray } from "drizzle-orm";
import { ProdutoRepository } from "../../application/repositories/ProdutoRepository";
import { ProdutoQuimico } from "../../domain/entities/ProdutoQuimico";
import { StatusProduto } from "../../domain/enums/StatusProduto";
import { DomainError } from "../../domain/errors/DomainError";
import { Referencia } from "../../domain/value-objects/Referencia";
import { db, DbExecutor } from "../database";
import {
    classeRisco,
    grupoCompatibilidade,
    produtoGrupoCompatibilidade,
    produtoQuimico,
} from "../database/schema";

const UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Colunas de uma tabela de cadastro lidas como Referencia (descricao ainda pode ser null). */
const colunasGrupo = {
    id: grupoCompatibilidade.id,
    codigo: grupoCompatibilidade.grupo,
    descricao: grupoCompatibilidade.descricao,
};
const colunasClasse = {
    id: classeRisco.id,
    codigo: classeRisco.classe,
    descricao: classeRisco.descricao,
};

function paraReferencia(linha: {
    id: string;
    codigo: string;
    descricao: string | null;
}): Referencia {
    return { ...linha, descricao: linha.descricao ?? undefined };
}

/**
 * Converte uma referência de grupo no grupo:
 * - id (UUID): o grupo precisa existir;
 * - código (ex.: "G1"): usa o grupo com esse código ou cria um novo.
 */
async function obterGrupo(
    ex: DbExecutor,
    referencia: string,
): Promise<Referencia> {
    if (UUID_REGEX.test(referencia)) {
        const [existente] = await ex
            .select(colunasGrupo)
            .from(grupoCompatibilidade)
            .where(eq(grupoCompatibilidade.id, referencia))
            .limit(1);
        if (!existente) {
            throw new DomainError(
                "GRUPO_COMPATIBILIDADE_NAO_ENCONTRADO",
                `Grupo de compatibilidade não encontrado: ${referencia}.`,
            );
        }
        return paraReferencia(existente);
    }

    const [existente] = await ex
        .select(colunasGrupo)
        .from(grupoCompatibilidade)
        .where(eq(grupoCompatibilidade.grupo, referencia))
        .limit(1);
    if (existente) return paraReferencia(existente);

    const [novo] = await ex
        .insert(grupoCompatibilidade)
        .values({ grupo: referencia })
        .returning(colunasGrupo);
    return paraReferencia(novo);
}

/** Substitui os grupos de compatibilidade vinculados ao produto. */
async function vincularGrupos(
    ex: DbExecutor,
    produtoId: string,
    grupos: Referencia[],
): Promise<void> {
    await ex
        .delete(produtoGrupoCompatibilidade)
        .where(eq(produtoGrupoCompatibilidade.produtoId, produtoId));
    if (grupos.length === 0) return;

    await ex.insert(produtoGrupoCompatibilidade).values(
        grupos.map(({ id }) => ({
            produtoId,
            grupoCompatibilidadeId: id,
        })),
    );
}

function consultarProdutos() {
    return db
        .select({
            produto: produtoQuimico,
            classe: colunasClasse,
        })
        .from(produtoQuimico)
        .innerJoin(
            classeRisco,
            eq(produtoQuimico.classeRiscoId, classeRisco.id),
        );
}

type LinhaProduto = Awaited<ReturnType<typeof consultarProdutos>>[number];

/**
 * Busca, via produto_grupo_compatibilidade, os grupos de cada produto
 * informado e devolve um Map produtoId -> grupos. Uma consulta só.
 */
async function buscarGruposDosProdutos(
    produtoIds: string[],
): Promise<Map<string, Referencia[]>> {
    const gruposPorProduto = new Map<string, Referencia[]>();
    if (produtoIds.length === 0) return gruposPorProduto;

    const linhas = await db
        .select({
            produtoId: produtoGrupoCompatibilidade.produtoId,
            ...colunasGrupo,
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

    for (const { produtoId, ...grupo } of linhas) {
        const grupos = gruposPorProduto.get(produtoId) ?? [];
        grupos.push(paraReferencia(grupo));
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
    gruposCompatibilidade: Referencia[],
): ProdutoQuimico {
    return ProdutoQuimico.reidratar({
        id: produto.id,
        nome: produto.nome,
        descricao: produto.descricao ?? undefined,
        numeroONU: produto.numeroOnu ?? "",
        classeRisco: paraReferencia(classe),
        gruposCompatibilidade,
        status: produto.status as StatusProduto,
        createdAt: produto.createdAt,
        updatedAt: produto.updatedAt,
    });
}

export class ProdutoRepositoryImpl implements ProdutoRepository {
    async criar(produto: ProdutoQuimico): Promise<ProdutoQuimico> {
        await db.transaction(async (tx) => {
            await tx.insert(produtoQuimico).values({
                id: produto.id,
                classeRiscoId: produto.classeRisco.id,
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

        // Relê do banco para a resposta sair igual à do GET.
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
            await tx
                .update(produtoQuimico)
                .set({
                    nome: dados.nome?.trim(),
                    descricao: dados.descricao,
                    classeRiscoId: dados.classeRisco?.id,
                    updatedAt: new Date(),
                })
                .where(eq(produtoQuimico.id, id));

            if (dados.gruposCompatibilidade !== undefined) {
                await vincularGrupos(tx, id, dados.gruposCompatibilidade);
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

    async ativar(id: string): Promise<void> {
        await db
            .update(produtoQuimico)
            .set({ status: StatusProduto.ATIVO, updatedAt: new Date() })
            .where(eq(produtoQuimico.id, id));
    }

    async obterGrupos(referencias: string[]): Promise<Referencia[]> {
        // Transação: se um id não existir, os grupos criados por código são desfeitos.
        return db.transaction(async (tx) => {
            const grupos: Referencia[] = [];
            for (const referencia of referencias) {
                grupos.push(await obterGrupo(tx, referencia));
            }
            return grupos;
        });
    }
}
