import { providePushObservable } from "@submodule/core";

export const modalStream = providePushObservable("view" as "view" | "edit")