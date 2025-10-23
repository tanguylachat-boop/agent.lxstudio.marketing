import "dotenv/config";
import { supabase } from "./client.js";
import { logger } from "../utils/logger.js";

/**
 * Seed de démonstration (2 idées, 1 script, 1 caption, 1 asset)
 */
async function seed() {
  logger.info("Seeding database...");

  // Idée 1
  const { data: idea1, error: error1 } = await supabase
    .from("ideas")
    .insert({
      title: "Site lent = clients perdus",
      hook1: "Votre site perd-il 60% de vos visiteurs ?",
      hook2: "3 clients sur 4 abandonnent un site trop lent.",
      hook3: "Payez-vous pour de la pub sans aucun retour ?",
      angle:
        "Montrer l'impact d'un site optimisé sur les réservations d'un hôtel local à Neuchâtel",
      cta: "Audit SEO gratuit → lxstudio.ch",
    })
    .select()
    .single();

  if (error1) {
    logger.error({ error: error1 }, "Failed to insert idea1");
  } else {
    logger.info({ id: idea1.id }, "Idea1 inserted");

    // Script pour idée 1
    const { data: script1, error: error2 } = await supabase
      .from("scripts")
      .insert({
        idea_id: idea1.id,
        script_text:
          "[0s] Votre site perd 60% de visiteurs ?\n[3s] Un site lent = clients perdus.\n[7s] Notre client hôtel a doublé ses réservations en 2 mois.\n[12s] Agent IA + SEO sur-mesure = résultats garantis.\n[16s] Audit gratuit → lxstudio.ch",
        duration_s: 18,
      })
      .select()
      .single();

    if (error2) {
      logger.error({ error: error2 }, "Failed to insert script1");
    } else {
      logger.info({ id: script1.id }, "Script1 inserted");
    }

    // Caption pour idée 1
    const { data: caption1, error: error3 } = await supabase
      .from("captions")
      .insert({
        idea_id: idea1.id,
        caption_a: "Votre site perd 60% de visiteurs ? Un audit SEO peut tout changer. On en parle ?",
        caption_b:
          "Site lent = clients perdus. Découvrez comment optimiser votre présence digitale. Intéressé ?",
        caption_c:
          "3 PME sur 4 ignorent leur potentiel SEO. Et vous, prêt à booster vos réservations ?",
        hashtags: [
          "#Suisse",
          "#Jura",
          "#Neuchâtel",
          "#SEO",
          "#SiteWeb",
          "#PME",
          "#Romandie",
          "#DigitalMarketing",
        ],
      })
      .select()
      .single();

    if (error3) {
      logger.error({ error: error3 }, "Failed to insert caption1");
    } else {
      logger.info({ id: caption1.id }, "Caption1 inserted");
    }

    // Asset pour idée 1
    const { data: asset1, error: error4 } = await supabase
      .from("assets")
      .insert({
        idea_id: idea1.id,
        type: "video",
        url_input: null,
        url_output: "https://storage.lxstudio.ch/demo-video-001.mp4",
        srt_url: "https://storage.lxstudio.ch/demo-subtitle-001.srt",
        status: "completed",
        metadata: {
          watermark: { enabled: true, text: "LX Studio", position: "bottom-right" },
          output_format: { width: 1080, height: 1920, fps: 30, max_size_mb: 50 },
        },
      })
      .select()
      .single();

    if (error4) {
      logger.error({ error: error4 }, "Failed to insert asset1");
    } else {
      logger.info({ id: asset1.id }, "Asset1 inserted");
    }
  }

  // Idée 2
  const { data: idea2, error: error5 } = await supabase
    .from("ideas")
    .insert({
      title: "Agent IA pour restaurants",
      hook1: "Vous perdez des réservations à 21h le vendredi ?",
      hook2: "1 appel sur 3 n'est jamais rappelé dans la restauration.",
      hook3: "Et si votre agent IA répondait H24 ?",
      angle:
        "Démontrer comment un agent IA peut gérer les réservations et questions clients 24/7 pour un restaurant à Delémont",
      cta: "Démo gratuite → lxstudio.ch",
    })
    .select()
    .single();

  if (error5) {
    logger.error({ error: error5 }, "Failed to insert idea2");
  } else {
    logger.info({ id: idea2.id }, "Idea2 inserted");
  }

  logger.info("Seeding completed!");
}

seed().catch((err) => {
  logger.error({ err }, "Seed failed");
  process.exit(1);
});
