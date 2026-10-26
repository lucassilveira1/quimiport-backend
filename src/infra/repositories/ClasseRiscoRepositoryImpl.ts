import { asc, eq } from "drizzle-orm";
import { ClasseRiscoRepository } from "../../application/repositories/ClasseRiscoRepository";
import { Referencia } from "../../domain/value-objects/Referencia";
import { db } from "../database";
import { classeRisco } from "../database/schema";

function consultarClasses() {
    return db
        .select({
            id: classeRisco.id,
            codigo: classeRisco.classe,
            descricao: classeRisco.descricao,
        })
        .from(classeRisco);
}

type LinhaClasse = Awaited<ReturnType<typeof consultarClasses>>[number];

function paraReferencia({ descricao, ...classe }: LinhaClasse): Referencia {
    return { ...classe, descricao: descricao ?? undefined };
}

export class ClasseRiscoRepositoryImpl implements ClasseRiscoRepository {
    async listar(): Promise<Referencia[]> {
        const linhas = await consultarClasses().orderBy(asc(classeRisco.classe));
        return linhas.map(paraReferencia);
    }

    async buscarPorId(id: string): Promise<Referencia | null> {
        const [linha] = await consultarClasses()
            .where(eq(classeRisco.id, id))
            .limit(1);
        return linha ? paraReferencia(linha) : null;
    }
}
