import { Router, Request, Response, NextFunction } from "express";
import { query, queryOne } from "../db/pool";
import { requireAdmin } from "../middleware/auth";

const router = Router();

// GET /api/settings (public — used by frontend for brand/contact info)
router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const row = await queryOne(`SELECT * FROM settings WHERE id=1`);
    if (!row) {
      res.status(404).json({ error: "Settings not found" });
      return;
    }
    // Shape into the frontend Settings type
    const s = row as Record<string, unknown>;
    res.json({
      contact: {
        email: s.contact_email,
        location: s.contact_location,
        socials: {
          twitter: s.social_twitter,
          instagram: s.social_instagram,
          linkedin: s.social_linkedin,
          github: s.social_github,
        },
      },
      developer: {
        name: s.dev_name,
        title: s.dev_title,
        bio: s.dev_bio,
        avatarUrl: s.dev_avatar_url,
        yearsExperience: s.dev_years_exp,
        location: s.dev_location,
      },
      brand: {
        studioName: s.brand_studio_name,
        legalName: s.brand_legal_name,
        tagline: s.brand_tagline,
      },
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/settings (admin)
router.patch("/", requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { contact, developer, brand } = req.body;
    await query(
      `UPDATE settings SET
       contact_email=COALESCE($1,contact_email),
       contact_location=COALESCE($2,contact_location),
       social_twitter=COALESCE($3,social_twitter),
       social_instagram=COALESCE($4,social_instagram),
       social_linkedin=COALESCE($5,social_linkedin),
       social_github=COALESCE($6,social_github),
       dev_name=COALESCE($7,dev_name),
       dev_title=COALESCE($8,dev_title),
       dev_bio=COALESCE($9,dev_bio),
       dev_avatar_url=COALESCE($10,dev_avatar_url),
       dev_years_exp=COALESCE($11,dev_years_exp),
       dev_location=COALESCE($12,dev_location),
       brand_studio_name=COALESCE($13,brand_studio_name),
       brand_legal_name=COALESCE($14,brand_legal_name),
       brand_tagline=COALESCE($15,brand_tagline)
       WHERE id=1`,
      [
        contact?.email, contact?.location,
        contact?.socials?.twitter, contact?.socials?.instagram, contact?.socials?.linkedin, contact?.socials?.github,
        developer?.name, developer?.title, developer?.bio, developer?.avatarUrl, developer?.yearsExperience, developer?.location,
        brand?.studioName, brand?.legalName, brand?.tagline,
      ]
    );
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
