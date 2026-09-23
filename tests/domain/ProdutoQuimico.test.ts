import { ProdutoQuimico } from '../../src/domain/entities/ProdutoQuimico';
import { ClasseRisco } from '../../src/domain/enums/ClasseRisco';
import { StatusProduto } from '../../src/domain/enums/StatusProduto';
import { DomainError } from '../../src/domain/errors/DomainError';

describe('ProdutoQuimico', () => {
  const propsValidas = {
    nome: 'Ácido Sulfúrico',
    numeroONU: 'UN1830',
    classeRisco: ClasseRisco.CLASSE_8_CORROSIVOS,
  };

  it('cria um produto químico válido com status ATIVO por padrão', () => {
    const produto = ProdutoQuimico.criar(propsValidas);
    expect(produto.status).toBe(StatusProduto.ATIVO);
    expect(produto.estaAtivo()).toBe(true);
  });

  it('não permite criar produto sem nome', () => {
    expect(() => ProdutoQuimico.criar({ ...propsValidas, nome: '' })).toThrow(DomainError);
  });

  it('não permite criar produto sem classe de risco válida', () => {
    expect(() =>
      ProdutoQuimico.criar({ ...propsValidas, classeRisco: 'invalida' as ClasseRisco })
    ).toThrow(DomainError);
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
});
