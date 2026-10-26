import { ProdutoQuimico } from '../../src/domain/entities/ProdutoQuimico';
import { StatusProduto } from '../../src/domain/enums/StatusProduto';
import { DomainError } from '../../src/domain/errors/DomainError';
import { Referencia } from '../../src/domain/value-objects/Referencia';

describe('ProdutoQuimico', () => {
  const propsValidas = {
    nome: 'Ácido Sulfúrico',
    numeroONU: 'UN1830',
    classeRisco: { id: 'classe-8', codigo: 'classe_8_corrosivos' },
  };

  it('cria um produto químico válido com status ATIVO por padrão', () => {
    const produto = ProdutoQuimico.criar(propsValidas);
    expect(produto.status).toBe(StatusProduto.ATIVO);
    expect(produto.estaAtivo()).toBe(true);
  });

  it('não permite criar produto sem nome', () => {
    expect(() => ProdutoQuimico.criar({ ...propsValidas, nome: '' })).toThrow(DomainError);
  });

  it('não permite criar produto sem classe de risco', () => {
    expect(() =>
      ProdutoQuimico.criar({ ...propsValidas, classeRisco: undefined as unknown as Referencia })
    ).toThrow(DomainError);
  });

  it('remove grupos de compatibilidade repetidos pelo id', () => {
    const g1 = { id: 'g1', codigo: 'G1' };
    const produto = ProdutoQuimico.criar({ ...propsValidas, gruposCompatibilidade: [g1, g1] });
    expect(produto.gruposCompatibilidade).toEqual([g1]);
  });

  it('inativa um produto ativo', () => {
    const produto = ProdutoQuimico.criar(propsValidas);
    produto.inativar();
    expect(produto.estaAtivo()).toBe(false);
  });

  it('não permite inativar um produto já inativo', () => {
    const produto = ProdutoQuimico.criar(propsValidas);
    produto.inativar();
    expect(() => produto.inativar()).toThrow(DomainError);
  });

  it('reativa um produto inativo', () => {
    const produto = ProdutoQuimico.criar(propsValidas);
    produto.inativar();
    produto.ativar();
    expect(produto.estaAtivo()).toBe(true);
  });

  it('não permite ativar um produto já ativo', () => {
    const produto = ProdutoQuimico.criar(propsValidas);
    expect(() => produto.ativar()).toThrow(DomainError);
  });
});
