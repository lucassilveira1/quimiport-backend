CREATE TABLE "carga_quimica" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"produto_quimico_id" uuid NOT NULL,
	"responsavel_tecnico_id" uuid NOT NULL,
	"codigo_carga" text NOT NULL,
	"quantidade" text,
	"unidade_medida" text,
	"origem" text,
	"destino" text,
	"documentacao_obrigatoria" text,
	"status" text NOT NULL,
	"data_entrada" timestamp,
	"motivo_bloqueio" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "classe_risco" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"classe" text NOT NULL,
	"descricao" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documento" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"carga_quimica_id" uuid NOT NULL,
	"arquivo" text NOT NULL,
	"titulo" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "produto_carga_quimica" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"produto_id" uuid NOT NULL,
	"carga_quimica_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "produto_quimico" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"classe_risco_id" uuid NOT NULL,
	"grupo_compatibilidade_id" uuid NOT NULL,
	"nome" text NOT NULL,
	"descricao" text,
	"numero_onu" varchar(50),
	"status" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "responsavel_tecnico" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"telefone" text,
	"email" text,
	"cpf" varchar(14),
	"status" text NOT NULL,
	"registro_crq" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "grupo_compatibilidade" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"grupo" text NOT NULL,
	"descricao" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "carga_quimica" ADD CONSTRAINT "fk_carga_quimica_produto" FOREIGN KEY ("produto_quimico_id") REFERENCES "public"."produto_quimico"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carga_quimica" ADD CONSTRAINT "fk_carga_quimica_responsavel" FOREIGN KEY ("responsavel_tecnico_id") REFERENCES "public"."responsavel_tecnico"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documento" ADD CONSTRAINT "fk_documento_carga" FOREIGN KEY ("carga_quimica_id") REFERENCES "public"."carga_quimica"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "produto_carga_quimica" ADD CONSTRAINT "fk_produto_carga_produto" FOREIGN KEY ("produto_id") REFERENCES "public"."produto_quimico"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "produto_carga_quimica" ADD CONSTRAINT "fk_produto_carga_carga" FOREIGN KEY ("carga_quimica_id") REFERENCES "public"."carga_quimica"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "produto_quimico" ADD CONSTRAINT "fk_produto_quimico_classe_risco" FOREIGN KEY ("classe_risco_id") REFERENCES "public"."classe_risco"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "produto_quimico" ADD CONSTRAINT "fk_produto_quimico_grupo_compat" FOREIGN KEY ("grupo_compatibilidade_id") REFERENCES "public"."grupo_compatibilidade"("id") ON DELETE no action ON UPDATE no action;