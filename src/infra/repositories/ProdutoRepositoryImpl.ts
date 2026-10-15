// Implementação concreta do repositório de produtos químicos.
// Responsável: Amanda/Samuel

import { Pool } from 'pg';
import { ProdutoRepository } from '../../application/repositories/ProdutoRepository';
import { ProdutoQuimico, ProdutoQuimicoProps } from '../../domain/entities/ProdutoQuimico';
import { StatusProduto } from '../../domain/enums/StatusProduto';

export class ProdutoRepositoryImpl implements ProdutoRepository {
  constructor(private pool: Pool) {}

  async criar(produto: ProdutoQuimico): Promise<ProdutoQuimico> {
    const query = `
      INSERT INTO produto_quimico (
        id,
        classe_risco_id,
        grupo_compatibilidade_id,
        nome,
        descricao,
        numero_onu,
        status,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `;

    await this.pool.query(query, [
      produto.id,
      produto.classeRiscoId ?? null,
      produto.grupoCompatibilidadeId ?? null,
      produto.nome,
      produto.descricao ?? null,
      produto.numeroONU,
      produto.status,
      produto.createdAt,
      produto.updatedAt,
    ]);

    return produto;
  }

  async buscarPorId(id: string): Promise<ProdutoQuimico | null> {
    const query = `
      SELECT 
        id,
        classe_risco_id,
        grupo_compatibilidade_id,
        nome,
        descricao,
        numero_onu,
        status,
        created_at,
        updated_at
      FROM produto_quimico
      WHERE id = $1
    `;

    const result = await this.pool.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];

    return ProdutoQuimico.reidratar({
      id: row.id,
      classeRiscoId: row.classe_risco_id ?? undefined,
      grupoCompatibilidadeId: row.grupo_compatibilidade_id ?? undefined,
      nome: row.nome,
      descricao: row.descricao ?? undefined,
      numeroONU: row.numero_onu,
      status: row.status as StatusProduto,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }

  async listar(): Promise<ProdutoQuimico[]> {
    const query = `
      SELECT 
        id,
        classe_risco_id,
        grupo_compatibilidade_id,
        nome,
        descricao,
        numero_onu,
        status,
        created_at,
        updated_at
      FROM produto_quimico
      ORDER BY nome ASC
    `;

    const result = await this.pool.query(query);

    return result.rows.map((row) =>
      ProdutoQuimico.reidratar({
        id: row.id,
        classeRiscoId: row.classe_risco_id ?? undefined,
        grupoCompatibilidadeId: row.grupo_compatibilidade_id ?? undefined,
        nome: row.nome,
        descricao: row.descricao ?? undefined,
        numeroONU: row.numero_onu,
        status: row.status as StatusProduto,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      })
    );
  }

  async atualizar(id: string, dados: Partial<ProdutoQuimicoProps>): Promise<ProdutoQuimico> {
    const produtoExistente = await this.buscarPorId(id);
    if (!produtoExistente) {
      throw new Error('Produto químico não encontrado para atualização.');
    }

    // Aplica as alterações na entidade de domínio usando os campos da interface
    produtoExistente.atualizarDados({
      nome: dados.nome,
      descricao: dados.descricao,
      classeRiscoId: dados.classeRiscoId,
      grupoCompatibilidadeId: dados.grupoCompatibilidadeId,
    });

    const query = `
      UPDATE produto_quimico
      SET 
        nome = $1,
        descricao = $2,
        classe_risco_id = $3,
        grupo_compatibilidade_id = $4,
        updated_at = $5
      WHERE id = $6
    `;

    await this.pool.query(query, [
      produtoExistente.nome,
      produtoExistente.descricao ?? null,
      produtoExistente.classeRiscoId ?? null,
      produtoExistente.grupoCompatibilidadeId ?? null,
      produtoExistente.updatedAt,
      id,
    ]);

    return produtoExistente;
  }

  async inativar(id: string): Promise<void> {
    const produto = await this.buscarPorId(id);
    if (!produto) {
      throw new Error('Produto químico não encontrado para inativação.');
    }

    // Executa a regra de inativação no domínio
    produto.inativar();

    const query = `
      UPDATE produto_quimico
      SET status = $1, updated_at = $2
      WHERE id = $3
    `;

    await this.pool.query(query, [produto.status, produto.updatedAt, id]);
  }
}