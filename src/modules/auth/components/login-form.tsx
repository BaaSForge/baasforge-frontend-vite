import { GalleryVerticalEnd } from "lucide-react"
import { useSearchParams } from "react-router"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldGroup,
} from "@/components/ui/field"
import { getGoogleInitiateFormAction } from "../lib/google-auth"

export interface LoginFormProps extends React.ComponentProps<"div"> {
}

export function LoginForm({
  className,
  ...props
}: LoginFormProps) {
  const [searchParams] = useSearchParams();
  const callbackUrlParam = searchParams.get("callback-url");
  
  let callbackUrl: string;
  if (callbackUrlParam) {
    const decodedUrl = decodeURIComponent(callbackUrlParam);
    const url = new URL(decodedUrl, window.location.origin);
    url.searchParams.set("logged-in-from", "google");
    callbackUrl = url.toString();
  } else {
    callbackUrl = `${window.location.origin}/dashboard?logged-in-from=google`;
  }
  
  const googleInitiateAction = getGoogleInitiateFormAction(callbackUrl);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-2 text-center">
          <a
            href="#"
            className="flex flex-col items-center gap-2 font-medium"
          >
            <div className="flex size-8 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-6" />
            </div>
            <span className="sr-only">BAAL Inc.</span>
          </a>
          <h1 className="text-xl font-bold">Welcome to BAAL Inc.</h1>
          {/* <FieldDescription>
            Don&apos;t have an account? <a href="#">Sign up</a>
          </FieldDescription> */}
        </div>
        {/* <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            required
          />
        </Field>
        <Field>
          <Button type="submit">Login</Button>
        </Field>
        <FieldSeparator>Or</FieldSeparator> */}
        <Field className="grid gap-4">
          <form
            action={googleInitiateAction}
            method="post"
            className="contents"
          >
            <Button variant="outline" type="submit">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                  d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                  fill="currentColor"
                />
              </svg>
              Continue with Google
            </Button>
          </form>
        </Field>
      </FieldGroup>
      {/* <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription> */}
    </div>
  )
}
