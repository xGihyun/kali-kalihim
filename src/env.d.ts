/// <reference path="../.astro/types.d.ts" />
/// <reference path="../.astro/env.d.ts" />
/// <reference path="../.astro/actions.d.ts" />
/// <reference types="astro/client" />
/// <reference types="@clerk/astro/env" />

declare module "icons:react/*" {
  import type { SVGProps } from "react";
  import type React from "react";

  const component: (props: SVGProps<SVGSVGElement>) => React.ReactElement;
  export default component;
}

declare module "icons:astro/*" {
  const component: (
    props: astroHTML.JSX.SVGAttributes,
  ) => astroHTML.JSX.Element;
  export default component;
}

/// <reference types="astro/client" />
declare namespace App {
	interface Locals {
		session: import("lucia").Session | null;
		user: import("lucia").User | null;
	}
}
