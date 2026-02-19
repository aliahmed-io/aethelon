import { getSettings } from "./actions";
import { SettingsForm } from "./SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
    const settings = await getSettings();

    return <SettingsForm initialSettings={settings} />;
}
