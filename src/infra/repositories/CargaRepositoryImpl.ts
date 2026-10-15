// Implementação concreta do repositório de cargas químicas.
// Responsável: Amanda/Samuel

import { Pool } from 'pg'; // ou a sua instância de conexão com o banco
import { CargaRepository } from '../../application/repositories/CargaRepository';
import { CargaQuimica } from '../../domain/entities/CargaQuimica';
import { StatusCargaType } from '../../domain/value-objects/StatusCarga';
import { UnidadeMedida } from '../../domain/enums/UnidadeMedida';

export class CargaRepositoryImpl implements CargaRepository {
  constructor(private pool: Pool) {}

  async criar(carga: CargaQuimica): Promise<CargaQuimica> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // 1. Inserir a carga química
      const queryCarga = `
        INSERT INTO carga_quimica (
          id,
          responsavel_tecnico_id,
          codigo_carga,
          quantidade,
          unidade_medida,
          origem,
          destino,
          documentacao_obrigatoria,
          status,
          data_entrada,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `;

      await client.query(queryCarga, [
        carga.id,
        carga.responsavelTecnicoId,
        carga.codigoCarga,
        carga.quantidade,
        carga.unidadeMedida,
        carga.origem ?? null,
        carga.destino ?? null,
        carga.documentacaoObrigatoria,
        carga.status,
        carga.dataEntrada,
        carga.createdAt,
        carga.updatedAt,
      ]);

      // 2. Inserir a relação N:N com os produtos na tabela pivô
      if (carga.produtosQuimicosIds && carga.produtosQuimicosIds.length > 0) {
        for (const produtoId of carga.produtosQuimicosIds) {
          await client.query(
            `INSERT INTO produto_carga_quimica (produto_quimico_id, carga_quimica_id) VALUES ($1, $2)`,
            [produtoId, carga.id]
          );
        }
      }

      await client.query('COMMIT');
      return carga;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async buscarPorId(id: string): Promise<CargaQuimica | null> {
    const queryCarga = `
      SELECT 
        c.*,
        COALESCE(array_agg(pcq.produto_quimico_id) FILTER (WHERE pcq.produto_quimico_id IS NOT NULL), '{}') AS produtos_ids
      FROM carga_quimica c
      LEFT JOIN produto_carga_quimica pcq ON c.id = pcq.carga_quimica_id
      WHERE c.id = $1
      GROUP BY c.id
    `;

    const result = await this.pool.query(queryCarga, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];

    return CargaQuimica.reidratar({
      id: row.id,
      codigoCarga: row.codigo_carga,
      responsavelTecnicoId: row.responsavel_tecnico_id,
      produtosQuimicosIds: row.produtos_ids,
      quantidade: Number(row.quantidade),
      unidadeMedida: row.unidade_medida as UnidadeMedida,
      origem: row.origem,
      destino: row.destino,
      documentacaoObrigatoria: row.documentacao_obrigatoria,
      status: row.status as StatusCargaType,
      motivoBloqueio: row.motivo_bloqueio,
      dataEntrada: new Date(row.data_entrada),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }

  async listar(): Promise<CargaQuimica[]> {
    const queryListar = `
      SELECT 
        c.*,
        COALESCE(array_agg(pcq.produto_quimico_id) FILTER (WHERE pcq.produto_quimico_id IS NOT NULL), '{}') AS produtos_ids
      FROM carga_quimica c
      LEFT JOIN produto_carga_quimica pcq ON c.id = pcq.carga_quimica_id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `;

    const result = await this.pool.query(queryListar);

    return result.rows.map((row) =>
      CargaQuimica.reidratar({
        id: row.id,
        codigoCarga: row.codigo_carga,
        responsavelTecnicoId: row.responsavel_tecnico_id,
        produtosQuimicosIds: row.produtos_ids,
        quantidade: Number(row.quantidade),
        unidadeMedida: row.unidade_medida as UnidadeMedida,
        origem: row.origem,
        destino: row.destino,
        documentacaoObrigatoria: row.documentacao_obrigatoria,
        status: row.status as StatusCargaType,
        motivoBloqueio: row.motivo_bloqueio,
        dataEntrada: new Date(row.data_entrada),
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      })
    );
  }

  async atualizarStatus(id: string, novoStatus: StatusCargaType): Promise<CargaQuimica> {
    const queryAtualizar = `
      UPDATE carga_quimica 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `;

    await this.pool.query(queryAtualizar, [novoStatus, id]);

    const cargaAtualizada = await this.buscarPorId(id);
    if (!cargaAtualizada) {
      throw new Error('Carga química não encontrada após atualização de status.');
    }

    return cargaAtualizada;
  }
}