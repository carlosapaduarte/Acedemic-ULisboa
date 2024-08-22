import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "Study Tracker" },
    { name: "Study Tracker", content: "Welcome to Study Tracker!" },
  ];
};

export default function Index() {
  return (
    <div className="font-sans p-4">
      <h1 className="text-3xl font-bold">
        Welcome to the Student Tracker App!
      </h1>
      <p className="mt-4">
        We're excited to have you here. This is a simple app to help you keep
        track of your studies.
      </p>
    </div>
  );
}
