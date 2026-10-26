import { asc, eq, inArray } from "drizzle-orm";
import { CargaRepository } from "../../application/repositories/CargaRepository";
import {
    CargaQuimica,
    ProdutoDaCarga,
} from "../../domain/entities/CargaQuimica";
import { UnidadeMedida } from "../../domain/enums/UnidadeMedida";
import { DomainError } from "../../domain/errors/DomainError";
import { StatusCargaType } from "../../domain/value-objects/StatusCarga";
import { db } from "../database";
import {
    cargaQuimica,
    classeRisco,
    produtoCargaQuimica,
    produtoQuimico,
    responsavelTecnico,
} from "../database/schema";

function consultarCargas() {
    return db
        .select({
            carga: cargaQuimica,
            responsavel: {
                id: responsavelTecnico.id,
                nome: responsavelTecnico.nome,
            },
        })
        .from(cargaQuimica)
        .innerJoin(
            responsavelTecnico,
            eq(cargaQuimica.responsavelTecnicoId, responsavelTecnico.id),
        );
}

type LinhaCarga = Awaited<ReturnType<typeof consultarCargas>>[number];

/**
 * Busca, via produto_carga_quimica, os produtos de cada carga informada e
 * devolve um Map cargaId -> produtos. Uma consulta só, para todas as cargas.
 */
async function buscarProdutosDasCargas(
    cargaIds: string[],
): Promise<Map<string, ProdutoDaCarga[]>> {
    const produtosPorCarga = new Map<string, ProdutoDaCarga[]>();
    if (cargaIds.length === 0) return produtosPorCarga;

    const linhas = await db
        .select({
            cargaId: produtoCargaQuimica.cargaQuimicaId,
            id: produtoQuimico.id,
            nome: produtoQuimico.nome,
            numeroONU: produtoQuimico.numeroOnu,
            classeRisco: classeRisco.classe,
        })
        .from(produtoCargaQuimica)
        .innerJoin(
            produtoQuimico,
            eq(produtoCargaQuimica.produtoId, produtoQuimico.id),
        )
        .innerJoin(
            classeRisco,
            eq(produtoQuimico.classeRiscoId, classeRisco.id),
        )
        .where(inArray(produtoCargaQuimica.cargaQuimicaId, cargaIds))
        .orderBy(asc(produtoCargaQuimica.createdAt));

    for (const { cargaId, ...produto } of linhas) {
        const produtos = produtosPorCarga.get(cargaId) ?? [];
        produtos.push({ ...produto, numeroONU: produto.numeroONU ?? "" });
        produtosPorCarga.set(cargaId, produtos);
    }
    return produtosPorCarga;
}

async function paraEntidades(linhas: LinhaCarga[]): Promise<CargaQuimica[]> {
    const produtosPorCarga = await buscarProdutosDasCargas(
        linhas.map(({ carga }) => carga.id),
    );
    return linhas.map((linha) =>
        paraEntidade(linha, produtosPorCarga.get(linha.carga.id) ?? []),
    );
}

function paraEntidade(
    { carga, responsavel }: LinhaCarga,
    produtos: ProdutoDaCarga[],
): CargaQuimica {
    return CargaQuimica.reidratar({
        id: carga.id,
        codigoCarga: carga.codigoCarga,
        quantidade: Number(carga.quantidade),
        unidadeMedida: carga.unidadeMedida as UnidadeMedida,
        origem: carga.origem ?? undefined,
        destino: carga.destino ?? undefined,
        responsavelTecnico: responsavel,
        documentacaoObrigatoria: carga.documentacaoObrigatoria === "true",
        status: carga.status as StatusCargaType,
        motivoBloqueio: carga.motivoBloqueio ?? undefined,
        produtos,
        dataEntrada: carga.dataEntrada ?? carga.createdAt,
        createdAt: carga.createdAt,
        updatedAt: carga.updatedAt,
    });
}

export class CargaRepositoryImpl implements CargaRepository {
    async criar(carga: CargaQuimica): Promise<CargaQuimica> {
        await db.transaction(async (tx) => {
            await tx.insert(cargaQuimica).values({
                id: carga.id,
                responsavelTecnicoId: carga.responsavelTecnico.id,
                codigoCarga: carga.codigoCarga,
                quantidade: String(carga.quantidade),
                unidadeMedida: carga.unidadeMedida,
                origem: carga.origem,
                destino: carga.destino,
                documentacaoObrigatoria: String(carga.documentacaoObrigatoria),
                status: carga.status,
                dataEntrada: carga.dataEntrada,
                motivoBloqueio: carga.motivoBloqueio,
                createdAt: carga.createdAt,
                updatedAt: carga.updatedAt,
            });
            await tx.insert(produtoCargaQuimica).values(
                carga.produtos.map(({ id }) => ({
                    produtoId: id,
                    cargaQuimicaId: carga.id,
                })),
            );
        });

        // Relê do banco para a resposta já trazer o array de produtos.
        return (await this.buscarPorId(carga.id)) ?? carga;
    }

    async buscarPorId(id: string): Promise<CargaQuimica | null> {
        const linhas = await consultarCargas()
            .where(eq(cargaQuimica.id, id))
            .limit(1);
        const [carga] = await paraEntidades(linhas);
        return carga ?? null;
    }

    async listar(): Promise<CargaQuimica[]> {
        const linhas = await consultarCargas().orderBy(
            asc(cargaQuimica.createdAt),
        );
        return paraEntidades(linhas);
    }

    async atualizarStatus(
        id: string,
        novoStatus: StatusCargaType,
        motivoBloqueio?: string,
    ): Promise<CargaQuimica> {
        await db
            .update(cargaQuimica)
            .set({ status: novoStatus, motivoBloqueio, updatedAt: new Date() })
            .where(eq(cargaQuimica.id, id));

        const atualizada = await this.buscarPorId(id);
        if (!atualizada) {
            throw new DomainError(
                "CARGA_NAO_ENCONTRADA",
                "Carga química não encontrada.",
            );
        }
        return atualizada;
    }
}
