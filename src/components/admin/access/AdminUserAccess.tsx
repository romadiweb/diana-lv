import { useState } from "react";
import CreateAuthUser from "./CreateAuthUser";
import UserAccessManager from "./UserAccessManager";
import type { CreatedAuthUser } from "./types";

export default function AdminUserAccess() {
  const [lastCreated, setLastCreated] = useState<CreatedAuthUser | null>(null);

  return (
    <div>
      <h1 className="text-3xl font-semibold text-cocoa">Lietotāji</h1>
      <p className="mt-2 text-sm text-cocoa/70">
        Plūsma: <b>1) izveido Auth user</b> → <b>2) piešķir piekļuves (user_access)</b>.
      </p>

      <div className="mt-6 grid gap-6">
        <CreateAuthUser onCreated={(u) => setLastCreated(u)} />
        <UserAccessManager prefFill={lastCreated} />
      </div>
    </div>
  );
}
