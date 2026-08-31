/* ==========================================================================
   KenshuLink — Supabase クライアント初期化
   anon key のみ使用（RLSで保護されているため、ブラウザに置いても安全）。
   service role key は絶対にここに置かないこと。
   ※ 変数名は `supabaseClient` とする。CDN が既に `window.supabase` を
     使っているため、`const supabase = ...` にすると名前が衝突する。
   ========================================================================== */

const SUPABASE_URL = "https://gsqaggzafutqeypkamae.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzcWFnZ3phZnV0cWV5cGthbWFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2MDIxMjEsImV4cCI6MjEwMDE3ODEyMX0.VvUVh5N4HF2ncQHhtNbfRX0Jnqgsq8YcxU7yDrYOJqM";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
