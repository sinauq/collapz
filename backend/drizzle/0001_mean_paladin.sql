CREATE TABLE "noteLinks" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "noteLinks_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"source_id" integer,
	"target_id" integer,
	"relationship" text
);
--> statement-breakpoint
ALTER TABLE "noteLinks" ADD CONSTRAINT "noteLinks_source_id_notes_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."notes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "noteLinks" ADD CONSTRAINT "noteLinks_target_id_notes_id_fk" FOREIGN KEY ("target_id") REFERENCES "public"."notes"("id") ON DELETE no action ON UPDATE no action;