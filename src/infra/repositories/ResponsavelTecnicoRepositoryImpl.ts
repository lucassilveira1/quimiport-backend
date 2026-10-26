import { asc, eq } from "drizzle-orm";
import { ResponsavelTecnicoRepository } from "../../application/repositories/ResponsavelTecnicoRepository";
import {
    ResponsavelTecnico,
    StatusResponsavelTecnico,
} from "../../domain/entities/ResponsavelTecnico";
import { db } from "../database";
import { responsavelTecnico } from "../database/schema";

type LinhaResponsavel = typeof responsavelTecnico.$inferSelect;

function paraEntidade(linha: LinhaResponsavel): ResponsavelTecnico {
    return ResponsavelTecnico.reidratar({
        id: linha.id,
        nome: linha.nome,
        telefone: linha.telefone ?? undefined,
        email: linha.email ?? undefined,
        cpf: linha.cpf ?? undefined,
        registroCrq: linha.registroCrq ?? undefined,
        status: linha.status as StatusResponsavelTecnico,
        createdAt: linha.createdAt,
        updatedAt: linha.updatedAt,
    });
}

export class ResponsavelTecnicoRepositoryImpl
    implements ResponsavelTecnicoRepository
{
    async criar(responsavel: ResponsavelTecnico): Promise<ResponsavelTecnico> {
        const [linha] = await db
            .insert(responsavelTecnico)
            .values({
                id: responsavel.id,
                nome: responsavel.nome,
                telefone: responsavel.telefone,
                email: responsavel.email,
                cpf: responsavel.cpf,
                registroCrq: responsavel.registroCrq,
                status: responsavel.status,
                createdAt: responsavel.createdAt,
                updatedAt: responsavel.updatedAt,
            })
            .returning();
        return paraEntidade(linha);
    }

    async buscarPorId(id: string): Promise<ResponsavelTecnico | null> {
        const [linha] = await db
            .select()
            .from(responsavelTecnico)
            .where(eq(responsavelTecnico.id, id))
            .limit(1);
        return linha ? paraEntidade(linha) : null;
    }

    async listar(): Promise<ResponsavelTecnico[]> {
        const linhas = await db
            .select()
            .from(responsavelTecnico)
            .orderBy(asc(responsavelTecnico.nome));
        return linhas.map(paraEntidade);
    }
}
