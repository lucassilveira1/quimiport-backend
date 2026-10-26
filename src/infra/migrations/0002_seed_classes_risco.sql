-- Classes de risco da ONU (mesmos valores de src/domain/enums/ClasseRisco.ts).
-- O produto químico agora recebe o id da classe, então elas precisam existir.
-- Não duplica classes que já tenham sido gravadas antes (o código antigo criava
-- a classe sem descrição ao cadastrar produto); nessas, só preenche a descrição.
CREATE TEMPORARY TABLE "seed_classe_risco" ("classe" text, "descricao" text);
--> statement-breakpoint
INSERT INTO "seed_classe_risco" VALUES
	('classe_1_explosivos', 'Explosivos'),
	('classe_2_gases', 'Gases'),
	('classe_3_liquidos_inflamaveis', 'Líquidos inflamáveis'),
	('classe_4_solidos_inflamaveis', 'Sólidos inflamáveis'),
	('classe_5_substancias_oxidantes', 'Substâncias oxidantes e peróxidos orgânicos'),
	('classe_6_substancias_toxicas', 'Substâncias tóxicas e infectantes'),
	('classe_7_material_radioativo', 'Material radioativo'),
	('classe_8_corrosivos', 'Substâncias corrosivas'),
	('classe_9_diversos', 'Substâncias e artigos perigosos diversos');
--> statement-breakpoint
UPDATE "classe_risco" c
SET "descricao" = s.descricao
FROM "seed_classe_risco" s
WHERE c.classe = s.classe AND c.descricao IS NULL;
--> statement-breakpoint
INSERT INTO "classe_risco" ("classe", "descricao")
SELECT s.classe, s.descricao
FROM "seed_classe_risco" s
WHERE NOT EXISTS (SELECT 1 FROM "classe_risco" c WHERE c.classe = s.classe);
--> statement-breakpoint
DROP TABLE "seed_classe_risco";
