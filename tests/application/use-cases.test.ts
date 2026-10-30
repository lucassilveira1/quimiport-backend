import { CriarProduto } from '../../src/application/use-cases/produto/CriarProduto';
import { InativarProduto } from '../../src/application/use-cases/produto/InativarProduto';
import { RegistrarCarga } from '../../src/application/use-cases/carga/RegistrarCarga';
import { AtualizarStatusCarga } from '../../src/application/use-cases/carga/AtualizarStatusCarga';
import { LiberarCarga } from '../../src/application/use-cases/carga/LiberarCarga';
import { BloquearCarga } from '../../src/application/use-cases/carga/BloquearCarga';
import { CancelarCarga } from '../../src/application/use-cases/carga/CancelarCarga';
import { ClasseRisco } from '../../src/domain/enums/ClasseRisco';
import { UnidadeMedida } from '../../src/domain/enums/UnidadeMedida';
import { DomainError } from '../../src/domain/errors/DomainError';
import {
  CLASSE_RISCO_ID,
  CargaRepositoryEmMemoria,
  ClasseRiscoRepositoryEmMemoria,
  GrupoCompatibilidadeRepositoryEmMemoria,
  ProdutoRepositoryEmMemoria,
  RESPONSAVEL,
  ResponsavelTecnicoRepositoryEmMemoria,
} from '../api/helpers';

describe('Casos de uso - fluxo completo (sem HTTP, sem banco)', () => {
  it('cria um produto, registra uma carga e leva ela até a liberação', async () => {
    const produtoRepository = new ProdutoRepositoryEmMemoria();
    const cargaRepository = new CargaRepositoryEmMemoria();
    const classeRiscoRepository = new ClasseRiscoRepositoryEmMemoria();
    const responsavelTecnicoRepository = new ResponsavelTecnicoRepositoryEmMemoria();

    const produto = await new CriarProduto(produtoRepository, classeRiscoRepository, new GrupoCompatibilidadeRepositoryEmMemoria()).executar({
      nome: 'Ácido Sulfúrico',
      numeroONU: 'UN1830',
      classeRisco: CLASSE_RISCO_ID[ClasseRisco.CLASSE_8_CORROSIVOS],
    });

    const carga = await new RegistrarCarga(cargaRepository, produtoRepository, responsavelTecnicoRepository).executar({
      codigoCarga: 'CARGA-001',
      produtos: [produto.id],
      quantidade: 500,
      unidadeMedida: UnidadeMedida.KG,
      responsavelTecnico: RESPONSAVEL.id,
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
    const classeRiscoRepository = new ClasseRiscoRepositoryEmMemoria();
    const responsavelTecnicoRepository = new ResponsavelTecnicoRepositoryEmMemoria();

    const produto = await new CriarProduto(produtoRepository, classeRiscoRepository, new GrupoCompatibilidadeRepositoryEmMemoria()).executar({
      nome: 'Cloro Líquido',
      numeroONU: 'UN1017',
      classeRisco: CLASSE_RISCO_ID[ClasseRisco.CLASSE_2_GASES],
    });
    await new InativarProduto(produtoRepository).executar(produto.id);

    await expect(
      new RegistrarCarga(cargaRepository, produtoRepository, responsavelTecnicoRepository).executar({
        codigoCarga: 'CARGA-002',
        produtos: [produto.id],
        quantidade: 200,
        unidadeMedida: UnidadeMedida.KG,
        responsavelTecnico: RESPONSAVEL.id,
        documentacaoObrigatoria: false,
      })
    ).rejects.toThrow(DomainError);
  });

  it('bloqueia e depois cancela uma carga em inspeção', async () => {
    const produtoRepository = new ProdutoRepositoryEmMemoria();
    const cargaRepository = new CargaRepositoryEmMemoria();
    const classeRiscoRepository = new ClasseRiscoRepositoryEmMemoria();
    const responsavelTecnicoRepository = new ResponsavelTecnicoRepositoryEmMemoria();

    const produto = await new CriarProduto(produtoRepository, classeRiscoRepository, new GrupoCompatibilidadeRepositoryEmMemoria()).executar({
      nome: 'Hidróxido de Sódio',
      numeroONU: 'UN1823',
      classeRisco: CLASSE_RISCO_ID[ClasseRisco.CLASSE_8_CORROSIVOS],
    });

    const carga = await new RegistrarCarga(cargaRepository, produtoRepository, responsavelTecnicoRepository).executar({
      codigoCarga: 'CARGA-004',
      produtos: [produto.id],
      quantidade: 300,
      unidadeMedida: UnidadeMedida.KG,
      responsavelTecnico: RESPONSAVEL.id,
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
    const classeRiscoRepository = new ClasseRiscoRepositoryEmMemoria();
    const responsavelTecnicoRepository = new ResponsavelTecnicoRepositoryEmMemoria();
    await expect(new LiberarCarga(cargaRepository).executar('nao-existe')).rejects.toThrow(DomainError);
  });
});
