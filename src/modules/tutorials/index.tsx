"use client";

import {
    findActiveTutorialId,
    getTutorialsByGroupId,
    useTutorialStatuses,
    WELCOME_TUTORIALS_GROUP_ID,
    type TutorialId,
} from "@/services/tutorials";
import { useMemo, type ComponentType } from "react";
import { CostsInActionTutorial } from "./welcome-tutorials/6.costs-in-action";
import { DebugAndReleaseTutorial } from "./welcome-tutorials/3.debug-and-release";
import { ProjectVariablesTutorial } from "./welcome-tutorials/5.project-variables";
import { UnitsAndRollbacksTutorial } from "./welcome-tutorials/4.units-and-rollbacks";
import { WriteAndCallYourApiTutorial } from "./welcome-tutorials/2.write-and-call-your-api";
import { YourFirstProjectTutorial } from "./welcome-tutorials/1.your-first-project";

const WELCOME_TUTORIAL_COMPONENTS = {
    "your-first-project": YourFirstProjectTutorial,
    "write-and-call-your-api": WriteAndCallYourApiTutorial,
    "debug-and-release": DebugAndReleaseTutorial,
    "units-and-rollbacks": UnitsAndRollbacksTutorial,
    "project-variables": ProjectVariablesTutorial,
    "costs-in-action": CostsInActionTutorial,
} satisfies Record<TutorialId, ComponentType>;

/**
 * Modal caution: tutorial spotlights block interaction outside the highlighted target.
 * If a modal is open at the same time, its backdrop covers the rest of the UI. When
 * backdrop dismiss is disabled (`dismissOnOverlayClick={false}`), overlay clicks cannot
 * close the modal—only in-modal controls can. Never leave a non-dismissible-by-backdrop
 * modal open (or open one) while a tutorial may start or is running.
 */
export function TutorialGlobalHost() {
    const tutorialIds = useMemo(
        () => getTutorialsByGroupId(WELCOME_TUTORIALS_GROUP_ID).map((tutorial) => tutorial.id),
        [],
    );
    const statusesById = useTutorialStatuses(WELCOME_TUTORIALS_GROUP_ID, tutorialIds);

    const activeTutorialId = useMemo(() => {
        if (statusesById == null) return null;
        return findActiveTutorialId(WELCOME_TUTORIALS_GROUP_ID, statusesById);
    }, [statusesById]);

    if (activeTutorialId == null) return null;

    const ActiveTutorial = WELCOME_TUTORIAL_COMPONENTS[activeTutorialId];
    return <ActiveTutorial />;
}
