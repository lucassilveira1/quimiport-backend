import { CriarProduto } from '../../src/application/use-cases/produto/CriarProduto';
import { InativarProduto } from '../../src/application/use-cases/produto/InativarProduto';
import { RegistrarCarga } from '../../src/application/use-cases/carga/RegistrarCarga';
import { AtualizarStatusCarga } from '../../src/application/use-cases/carga/AtualizarStatusCarga';
import { LiberarCarga } from '../../src/application/use-cases/carga/LiberarCarga';
import { BloquearCarga } from '../../src/application/use-cases/carga/BloquearCarga';
import { CancelarCarga } from '../../src/application/use-cases/carga/CancelarCarga';
import { ProdutoRepository } from '../../src/application/repositories/ProdutoRepository';
import { CargaRepository } from '../../src/application/repositories/CargaRepository';
import { ProdutoQuimico } from '../../src/domain/entities/ProdutoQuimico';
import { CargaQuimica } from '../../src/domain/entities/CargaQuimica';
import { ClasseRisco } from '../../src/domain/enums/ClasseRisco';
import { UnidadeMedida } from '../../src/domain/enums/UnidadeMedida';
import { StatusCargaType } from '../../src/domain/value-objects/StatusCarga';
import { DomainError } from '../../src/domain/errors/DomainError';

class ProdutoRepositoryEmMemoria implements ProdutoRepository {
  private produtos = new Map<string, ProdutoQuimico>();
  async criar(produto: ProdutoQuimico) {
    this.produtos.set(produto.id, produto);
    return produto;
  }
  async buscarPorId(id: string) {
    return this.produtos.get(id) ?? null;
  }
  async listar() {
    return [...this.produtos.values()];
  }
  async atualizar(id: string) {
    return this.produtos.get(id)!;
  }
  async inativar(id: string) {
    // A entidade já foi inativada pelo caso de uso antes de chamar o
    // repositório — aqui só simula persistir o estado já atualizado.
  }
}

class CargaRepositoryEmMemoria implements CargaRepository {
  private cargas = new Map<string, CargaQuimica>();
  async criar(carga: CargaQuimica) {
    this.cargas.set(carga.id, carga);
    return carga;
  }
  async buscarPorId(id: string) {
    return this.cargas.get(id) ?? null;
  }
  async listar() {
    return [...this.cargas.values()];
  }
  async atualizarStatus(id: string, novoStatus: StatusCargaType) {
    const carga = this.cargas.get(id)!;
    return carga;
  }
}

describe('Casos de uso - fluxo completo (sem HTTP, sem banco)', () => {
  it('cria um produto, registra uma carga e leva ela até a liberação', async () => {
    const produtoRepository = new ProdutoRepositoryEmMemoria();
    const cargaRepository = new CargaRepositoryEmMemoria();

    const produto = await new CriarProduto(produtoRepository).executar({
      nome: 'Ácido Sulfúrico',
      numeroONU: 'UN1830',
      classeRisco: ClasseRisco.CLASSE_8_CORROSIVOS,
    });

    const carga = await new RegistrarCarga(cargaRepository, produtoRepository).executar({
      codigoCarga: 'CARGA-001',
      produtoQuimicoId: produto.id,
      quantidade: 500,
      unidadeMedida: UnidadeMedida.KG,
      responsavelTecnico: 'Eng. Maria Souza',
      documentacaoObrigatoria: true,
    });
    expect(carga.status).toBe('registrada');

    await new AtualizarStatusCarga(cargaRepository).executar(carga.id, 'em_analise');
    await new AtualizarStatusCarga(cargaRepository).executar(carga.id, 'em_inspecao');

    const cargaLiberada = await new LiberarCarga(cargaRepository).executar(carga.id);
    expect(cargaLiberada.status).toBe('liberada');
  });

  it('rejeita o registro de carga associada a um produto inativo', async () => {
    const produtoRepository = new ProdutoRepositoryEmMemoria();
    const cargaRepository = new CargaRepositoryEmMemoria();

    const produto = await new CriarProduto(produtoRepository).executar({
      nome: 'Cloro Líquido',
      numeroONU: 'UN1017',
      classeRisco: ClasseRisco.CLASSE_2_GASES,
    });
    await new InativarProduto(produtoRepository).executar(produto.id);

    await expect(
      new RegistrarCarga(cargaRepository, produtoRepository).executar({
        codigoCarga: 'CARGA-002',
        produtoQuimicoId: produto.id,
        quantidade: 200,
        unidadeMedida: UnidadeMedida.KG,
        responsavelTecnico: 'Eng. Carlos Lima',
        documentacaoObrigatoria: false,
      })
    ).rejects.toThrow(DomainError);
  });

  it('bloqueia e depois cancela uma carga em inspeção', async () => {
    const produtoRepository = new ProdutoRepositoryEmMemoria();
    const cargaRepository = new CargaRepositoryEmMemoria();

    const produto = await new CriarProduto(produtoRepository).executar({
      nome: 'Hidróxido de Sódio',
      numeroONU: 'UN1823',
      classeRisco: ClasseRisco.CLASSE_8_CORROSIVOS,
    });

    const carga = await new RegistrarCarga(cargaRepository, produtoRepository).executar({
      codigoCarga: 'CARGA-004',
      produtoQuimicoId: produto.id,
      quantidade: 300,
      unidadeMedida: UnidadeMedida.KG,
      responsavelTecnico: 'Eng. Pedro Alves',
      documentacaoObrigatoria: true,
    });

    await new AtualizarStatusCarga(cargaRepository).executar(carga.id, 'em_analise');
    await new AtualizarStatusCarga(cargaRepository).executar(carga.id, 'em_inspecao');

    const cargaBloqueada = await new BloquearCarga(cargaRepository).executar(
      carga.id,
      'Divergência entre nota fiscal e documentação anexada.'
    );
    expect(cargaBloqueada.status).toBe('bloqueada');

    const cargaCancelada = await new CancelarCarga(cargaRepository).executar(carga.id);
    expect(cargaCancelada.status).toBe('cancelada');
  });

  it('lança erro ao tentar operar sobre uma carga que não existe', async () => {
    const cargaRepository = new CargaRepositoryEmMemoria();
    await expect(new LiberarCarga(cargaRepository).executar('nao-existe')).rejects.toThrow(DomainError);
  });
});
