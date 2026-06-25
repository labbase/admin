"use client";

import { Suspense } from "react";
import ResetForm from "./ResetForm";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetForm />
    </Suspense>
  );
}



