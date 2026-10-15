/**
 * Classes de risco seguem o modelo de classificação de produtos perigosos
 * da ONU (UN Recommendations on the Transport of Dangerous Goods).
 */
export enum ClasseRisco {
  CLASSE_1_EXPLOSIVOS = 'classe_1_explosivos',
  CLASSE_2_GASES = 'classe_2_gases',
  CLASSE_3_LIQUIDOS_INFLAMAVEIS = 'classe_3_liquidos_inflamaveis',
  CLASSE_4_SOLIDOS_INFLAMAVEIS = 'classe_4_solidos_inflamaveis',
  CLASSE_5_SUBSTANCIAS_OXIDANTES = 'classe_5_substancias_oxidantes',
  CLASSE_6_SUBSTANCIAS_TOXICAS = 'classe_6_substancias_toxicas',
  CLASSE_7_MATERIAL_RADIOATIVO = 'classe_7_material_radioativo',
  CLASSE_8_CORROSIVOS = 'classe_8_corrosivos',
  CLASSE_9_DIVERSOS = 'classe_9_diversos',
}
