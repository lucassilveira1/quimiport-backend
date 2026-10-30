-- Grupos de compatibilidade cadastrados (inspirados nos grupos de segregação do código IMDG).
-- O produto químico só aceita grupos que existem nesta tabela, pelo id ou pelo código.
-- Não duplica grupos que já tenham sido gravados antes (o código antigo criava o
-- grupo sem descrição ao cadastrar produto); nesses, só preenche a descrição.
CREATE TEMPORARY TABLE "seed_grupo_compatibilidade" ("grupo" text, "descricao" text);
--> statement-breakpoint
INSERT INTO "seed_grupo_compatibilidade" VALUES
	('G1', 'Ácidos'),
	('G2', 'Bases (álcalis)'),
	('G3', 'Oxidantes'),
	('G4', 'Inflamáveis');
--> statement-breakpoint
UPDATE "grupo_compatibilidade" g
SET "descricao" = s.descricao
FROM "seed_grupo_compatibilidade" s
WHERE g.grupo = s.grupo AND g.descricao IS NULL;
--> statement-breakpoint
INSERT INTO "grupo_compatibilidade" ("grupo", "descricao")
SELECT s.grupo, s.descricao
FROM "seed_grupo_compatibilidade" s
WHERE NOT EXISTS (SELECT 1 FROM "grupo_compatibilidade" g WHERE g.grupo = s.grupo);
--> statement-breakpoint
DROP TABLE "seed_grupo_compatibilidade";
