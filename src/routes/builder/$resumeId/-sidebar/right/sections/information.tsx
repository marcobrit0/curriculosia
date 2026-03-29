import { Trans } from "@lingui/react/macro";
import { HandHeartIcon } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";

import { SectionBase } from "../shared/section-base";

export function InformationSectionBuilder() {
  return (
    <SectionBase type="information" className="space-y-4">
      <div className="space-y-2 rounded-md border bg-sky-600 p-5 text-white dark:bg-sky-700">
        <h4 className="font-medium tracking-tight">
          <Trans>Support the app by doing what you can!</Trans>
        </h4>

        <div className="space-y-2 text-xs leading-normal">
          <Trans>
            <p>
              Thank you for using Currículos IA! This app is built and maintained with care to help people create
              professional resumes without unnecessary friction.
            </p>
            <p>
              If Currículos IA has been helpful to you, starring the repository, reporting issues, and sharing feedback
              are great ways to help it improve.
            </p>
          </Trans>
        </div>

        <Button
          size="sm"
          variant="default"
          nativeButton={false}
          className="mt-2 px-4! text-xs whitespace-normal"
          render={
            <a href="https://github.com/marcobrit0/curriculosia" target="_blank" rel="noopener">
              <HandHeartIcon />
              <span className="truncate">
                <Trans>Visit the repository</Trans>
              </span>
            </a>
          }
        />
      </div>

      <div className="flex flex-wrap gap-0.5">
        <Button
          size="sm"
          variant="link"
          className="text-xs"
          nativeButton={false}
          render={
            <a href="https://docs.curriculos.ia.br" target="_blank" rel="noopener">
              <Trans>Documentation</Trans>
            </a>
          }
        />

        <Button
          size="sm"
          variant="link"
          className="text-xs"
          nativeButton={false}
          render={
            <a href="https://github.com/marcobrit0/curriculosia" target="_blank" rel="noopener">
              <Trans>Source Code</Trans>
            </a>
          }
        />

        <Button
          size="sm"
          variant="link"
          className="text-xs"
          nativeButton={false}
          render={
            <a href="https://github.com/marcobrit0/curriculosia/issues" target="_blank" rel="noopener">
              <Trans>Report a Bug</Trans>
            </a>
          }
        />

        <Button
          size="sm"
          variant="link"
          className="text-xs"
          nativeButton={false}
          render={
            <a href="https://github.com/marcobrit0/curriculosia" target="_blank" rel="noopener">
              <Trans>Translations</Trans>
            </a>
          }
        />

        <Button
          size="sm"
          variant="link"
          className="text-xs"
          nativeButton={false}
          render={
            <a href="https://github.com/marcobrit0/curriculosia/issues" target="_blank" rel="noopener">
              <Trans>Feedback</Trans>
            </a>
          }
        />
      </div>
    </SectionBase>
  );
}
