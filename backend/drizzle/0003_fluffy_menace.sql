CREATE TABLE "note_links" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "note_links_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"source_id" integer NOT NULL,
	"target_id" integer NOT NULL,
	"relationship" text
);
--> statement-breakpoint
DROP TABLE "noteLinks" CASCADE;--> statement-breakpoint
ALTER TABLE "note_links" ADD CONSTRAINT "note_links_source_id_notes_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."notes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "note_links" ADD CONSTRAINT "note_links_target_id_notes_id_fk" FOREIGN KEY ("target_id") REFERENCES "public"."notes"("id") ON DELETE no action ON UPDATE no action;