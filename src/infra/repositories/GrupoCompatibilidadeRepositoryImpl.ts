import { asc, eq } from "drizzle-orm";
import { GrupoCompatibilidadeRepository } from "../../application/repositories/GrupoCompatibilidadeRepository";
import { Referencia } from "../../domain/value-objects/Referencia";
import { db } from "../database";
import { grupoCompatibilidade } from "../database/schema";

const UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function consultarGrupos() {
    return db
        .select({
            id: grupoCompatibilidade.id,
            codigo: grupoCompatibilidade.grupo,
            descricao: grupoCompatibilidade.descricao,
        })
        .from(grupoCompatibilidade);
}

type LinhaGrupo = Awaited<ReturnType<typeof consultarGrupos>>[number];

function paraReferencia({ descricao, ...grupo }: LinhaGrupo): Referencia {
    return { ...grupo, descricao: descricao ?? undefined };
}

export class GrupoCompatibilidadeRepositoryImpl
    implements GrupoCompatibilidadeRepository
{
    async listar(): Promise<Referencia[]> {
        const linhas = await consultarGrupos().orderBy(
            asc(grupoCompatibilidade.grupo),
        );
        return linhas.map(paraReferencia);
    }

    async buscarPorReferencia(referencia: string): Promise<Referencia | null> {
        // Um UUID é procurado pelo id; qualquer outro texto, pelo código.
        const filtro = UUID_REGEX.test(referencia)
            ? eq(grupoCompatibilidade.id, referencia)
            : eq(grupoCompatibilidade.grupo, referencia);
        const [linha] = await consultarGrupos().where(filtro).limit(1);
        return linha ? paraReferencia(linha) : null;
    }
}
