-- Row Level Security (RLS) policies

-- Activer RLS sur les tables sensibles
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE publishes ENABLE ROW LEVEL SECURITY;

-- Politique RLS pour leads (seuls les admins peuvent lire)
CREATE POLICY "Admins can read leads"
ON leads FOR SELECT
USING (auth.jwt() ->> 'role' = 'admin' OR auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can insert leads"
ON leads FOR INSERT
WITH CHECK (auth.jwt() ->> 'role' = 'service_role' OR auth.jwt() IS NULL);

-- Politique RLS pour jobs (lecture/écriture admin uniquement)
CREATE POLICY "Admins can read jobs"
ON jobs FOR SELECT
USING (auth.jwt() ->> 'role' = 'admin' OR auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage jobs"
ON jobs FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- Politique RLS pour publishes (lecture/écriture admin uniquement)
CREATE POLICY "Admins can read publishes"
ON publishes FOR SELECT
USING (auth.jwt() ->> 'role' = 'admin' OR auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage publishes"
ON publishes FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');
