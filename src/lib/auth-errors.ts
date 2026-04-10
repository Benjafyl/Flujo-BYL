function decodeMessage(value: string | null) {
  if (!value) {
    return null;
  }

  return decodeURIComponent(value.replace(/\+/g, " "));
}

export function readAuthErrorFromLocation(search: string, hash: string) {
  const sources = [search, hash.startsWith("#") ? hash.slice(1) : hash];

  for (const source of sources) {
    const params = new URLSearchParams(source);
    const errorCode = params.get("error_code");
    const description = decodeMessage(params.get("error_description"));

    if (!errorCode && !description) {
      continue;
    }

    return {
      code: errorCode ?? "unknown_auth_error",
      description,
    };
  }

  return null;
}

export function getFriendlyAuthErrorMessage(
  errorCode?: string | null,
  description?: string | null,
) {
  switch (errorCode) {
    case "otp_expired":
      return "El link ya vencio o ya fue usado. Pide uno nuevo y abre el correo mas reciente.";
    case "access_denied":
      return description ?? "Supabase rechazo el acceso. Prueba con un link nuevo.";
    default:
      return (
        description ??
        "No pude cerrar el acceso con ese link. Pide otro y vuelve a intentarlo."
      );
  }
}
