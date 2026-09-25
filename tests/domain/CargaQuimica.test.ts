import { CargaQuimica, CargaQuimicaProps } from '../../src/domain/entities/CargaQuimica';
import { UnidadeMedida } from '../../src/domain/enums/UnidadeMedida';
import { DomainError } from '../../src/domain/errors/DomainError';

describe('CargaQuimica', () => {
  const propsValidas: CargaQuimicaProps = {
    codigoCarga: 'CARGA-001',
    produtoQuimicoId: 'produto-123',
    quantidade: 1000,
    unidadeMedida: UnidadeMedida.KG,
    responsavelTecnico: 'Eng. João Silva',
    documentacaoObrigatoria: true,
  };

  it('registra uma carga válida com status "registrada"', () => {
    const carga = CargaQuimica.registrar(propsValidas, true);
    expect(carga.status).toBe('registrada');
  });

  it('não permite registrar carga com produto químico inativo', () => {
    expect(() => CargaQuimica.registrar(propsValidas, false)).toThrow(DomainError);
  });

  it('não permite registrar carga com quantidade zero ou negativa', () => {
    expect(() => CargaQuimica.registrar({ ...propsValidas, quantidade: 0 }, true)).toThrow(DomainError);
  });

  it('não permite registrar carga sem responsável técnico', () => {
    expect(() =>
      CargaQuimica.registrar({ ...propsValidas, responsavelTecnico: '   ' }, true)
    ).toThrow(DomainError);
  });

  it('não permite liberar carga sem documentação obrigatória', () => {
    const carga = CargaQuimica.registrar({ ...propsValidas, documentacaoObrigatoria: false }, true);
    carga.transicionarPara('em_analise');
    carga.transicionarPara('em_inspecao');
    expect(() => carga.liberar()).toThrow(DomainError);
  });

  it('libera a carga quando a documentação obrigatória está completa', () => {
    const carga = CargaQuimica.registrar(propsValidas, true);
    carga.transicionarPara('em_analise');
    carga.transicionarPara('em_inspecao');
    carga.liberar();
    expect(carga.status).toBe('liberada');
  });

  it('bloqueia a carga e impede que ela avance para movimentação', () => {
    const carga = CargaQuimica.registrar(propsValidas, true);
    carga.transicionarPara('em_analise');
    carga.transicionarPara('em_inspecao');
    carga.bloquear('Documentação suspeita.');
    expect(carga.status).toBe('bloqueada');
    expect(carga.motivoBloqueio).toBe('Documentação suspeita.');
    expect(() => carga.transicionarPara('em_movimentacao')).toThrow(DomainError);
  });

  it('cancela a carga a partir de "registrada"', () => {
    const carga = CargaQuimica.registrar(propsValidas, true);
    carga.cancelar();
    expect(carga.status).toBe('cancelada');
  });

  it('não permite liberar uma carga cancelada', () => {
    const carga = CargaQuimica.registrar(propsValidas, true);
    carga.cancelar();
    expect(() => carga.liberar()).toThrow(DomainError);
  });

  it('não permite finalizar uma carga em inspeção sem antes passar por liberada', () => {
    const carga = CargaQuimica.registrar(propsValidas, true);
    carga.transicionarPara('em_analise');
    carga.transicionarPara('em_inspecao');
    expect(() => carga.transicionarPara('finalizada')).toThrow(DomainError);
  });
});
