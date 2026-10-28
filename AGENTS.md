<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules
- Public pages live under `src/routes/_site/` (shared header/footer); the editor lives under `src/routes/_authenticated/admin*` — keeps public and editor shells separate.
- Public content is read through server functions in `src/lib/content.functions.ts` with the publishable key; only `status = 'published'` rows are exposed by policy.
- Editor writes go through the browser client and are enforced by admin-only database policies (`has_role`) — never trust UI checks alone.
- Case-study blocks are a validated list (`blockSchema` in `src/lib/content.ts`); add new block types there first.
- Media lives in a private storage bucket; uploads store a long-lived signed link because public buckets are blocked in this workspace.
- Admin access is granted by a signup trigger for the studio email; public signup is disabled.
