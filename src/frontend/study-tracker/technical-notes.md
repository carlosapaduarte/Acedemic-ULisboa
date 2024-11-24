# Technical Notes

## Architecture

All page content is inside the [routes](app/routes) folder.

---

Most pages require external interaction, usually to fetch and update state, from/on the backend server. This is done throught the [service](app/service/service.ts) component, which deals with all the external API communication.

## Login and Authentication

Inside the [root.tsx](app/root.tsx), the `root()` function has the `<AuthnContainer>` component wrapping the `<App />` one. This is to make sure that, before any page is rendered (a page is rendered inside the `<App />` component), the `<AuthnContainer>` component executed to assess if the user is logged in or not. This is important duo to authentication policies: same pages should be displayed or not, whether the user is or is not authenticated.

[Authn.tsx](app/components/auth/Authn.tsx) stores this log-in information. In particular, when deployed (in the [root.tsx](app/root.tsx) - `root()` function), it makes an external API call to the backend server, to check if the token is valid or not.

In this application, once a user logs-in, a `jwt` token is created, and stored within the `local-storage` browser featured.

---

For authentication purposes, and and said before, some pages are only accessible when the user is logged in. This is achieved through the `<RequireAuthn>` component, which is wrapped around in page root component. For instance, inside the [statistics/route.tsx](app/routes/statistics/route.tsx), `<RequireAuthn>` makes sure that the `Statistics()` component only renders if the user is authenticated.

## Styling

Most styling, apart from a few already-styled components, is done from scratch, through the use of [CSS-Modules](https://github.com/css-modules/css-modules). The argument is to ease development by limiting the each `css` class scope. This way, for instance, the [tasks](app/routes/tasks) page, contains a single [tasksPage.module.css](app/routes/tasks/tasksPage.module.css) file, which defines the classes used to style this particular page.

[global.css](app/global.css) defines some properties that are applicable to the entire project, such as the `body` and `button` classes, etc. It also defines some calor variables that are used in some `module.css` files.

## Error Handling

The [error](app/components/error/GlobalErrorContainer.tsx) [error](app/components/error) component defines the two components that handle global errors in the project. [GlobalErrorContainer.tsx](app/components/error/GlobalErrorContainer.tsx) is, as the name implies, a container that stores an existent error. On the other way, [GlobalErrorController.tsx](app/components/error/GlobalErrorController.tsx) is instantiated in a strategic position that allows it to display errors when they are set. Inside [root.ts](app/root.tsx), there is this chunk of code:

```javascript
return (
        <AppBarProvider>
            <div className="app">
                <AppBar aria-hidden={loading ? true : undefined} />
                <main className="mainContentContainer" aria-hidden={loading}>
                    <ReactErrorBoundary fallback={<h1>{t("error:title")}</h1>}>
                        <GlobalErrorController>
                            <Outlet />
                        </GlobalErrorController>
                    </ReactErrorBoundary>
                </main>
                <Footer aria-hidden={loading ? true : undefined} />
                <LoadingOverlay loading={loading} />
            </div>
        </AppBarProvider>
    );
}
```

As you can see, `<GlobalErrorController>` wraps `<Outlet />` (renders the current active/selected page). If a global error has been set (stored inside [GlobalErrorContainer.tsx](app/components/error/GlobalErrorContainer.tsx)), the component will render another component that displays the error, instead of the `<Outlet />` component (the current page). This is not the best approach to deal with individual errors, but it is one that can be, and is used when some an error happens, and there isn't yet a more delicated way of handling the error. This way, at least the user will know that something unexpected happened, instead of continuing to see the page and having the error happen without notice.\
As you can see through out the code base, most service calls are in the form:

```javascript
const setError = useSetGlobalError();
...
service.getThisWeekDailyTasksProgress()
    .then((res: DailyTasksProgress[]) => {
        ...
    })
    .catch((error) => setError(error));
```

This way, if an external request operation returns a `Promise.reject()`, the error won't go unnoticed.

## Services

To ease error handling, all functions only return the expected result: if the reply is of `200`s type. Otherwise, the function returns a rejected promise.

---

In some functions, such as the `updateEvent()`, that send timestamp data in the UTC form, the time is always divided by `1000`:

```javascript
...
startDate: inputDto.startDate.getTime() / 1000,
...
```

This is because, **javascript** works with milliseconds elapsed since 1970, as the default `UTC` format, unlike **python** that works with seconds.

## React Components Organization

In most complex/long react components, we used a pattern to improve separation of concerns and organization: pairs of components, where the first is responsible for the definition of what other child components are rendered, and the second for the data storage and management, that is typically used in the first component, to be displayed on. See more [here](https://legacy.reactjs.org/docs/hooks-overview.html).

## Language

The application supports two languages: English and Portuguese. The translations are in [locales](public/locales).