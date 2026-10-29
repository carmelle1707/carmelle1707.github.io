"use client";

import {
  type FormEvent,
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useSyncExternalStore,
} from "react";
import { toast } from "sonner";
import { type FormState, idleState } from "@/lib/form-state";

const noopSubscribe = () => () => {};

type Action = (prev: FormState, formData: FormData) => Promise<FormState>;

/**
 * Formulaire de l'admin : envoi sans réinitialiser les champs (la saisie reste en cas d'erreur),
 * notification sonner à chaque résultat, focus sur le premier champ en erreur.
 */
export function useAdminForm(action: Action) {
  const [state, run, pending] = useActionState(action, idleState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") toast.success(state.message);
    if (state.status === "error") {
      toast.error(state.message);
      formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
    }
  }, [state]);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(() => run(data));
  };

  // Tant que React n'a pas pris la main, le bouton reste désactivé : sinon le navigateur
  // enverrait le formulaire lui-même, sans passer par l'action.
  const ready = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  const errors = state.status === "error" ? state.fieldErrors : {};
  return { formRef, onSubmit, pending, ready, errors, state };
}
