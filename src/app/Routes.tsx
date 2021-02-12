import React from 'react';
import { Redirect, Route, RouteComponentProps, Switch } from 'react-router-dom';
import { accessibleRouteChangeHandler, useDocumentTitle } from '@app/utils';
import { NotFound } from '@app/NotFound/NotFound';
import { LastLocationProvider, useLastLocation } from 'react-router-last-location';
import { ControlPlanePage } from "@app/ControlPlanePage/ControlPlanePage";
import { DataPlanePage } from "@app/DataPlanePage/DataPlanePage";
import { QuickStartDrawerFederated } from "@app/Components/QuickStart/QuickStartDrawerFederated";
import { QuickStartCatalogFederated } from "@app/Components/QuickStart/QuickStartCatalogFederated";

let routeFocusTimer: number;

export interface IAppRoute {
  label?: string; // Excluding the label will exclude the route from the nav sidebar in AppLayout
  /* eslint-disable @typescript-eslint/no-explicit-any */
  component: React.ComponentType<RouteComponentProps<any>> | React.ComponentType<any>;
  /* eslint-enable @typescript-eslint/no-explicit-any */
  exact?: boolean;
  path: string;
  title: string;
  isAsync?: boolean;
  routes?: undefined;
}

export interface IAppRouteGroup {
  label: string;
  routes: IAppRoute[];
}

export type AppRouteConfig = IAppRoute | IAppRouteGroup;

const RedirectSlash: React.FunctionComponent = () => (<Redirect to="/openshift-streams" />)

const routes: AppRouteConfig[] = [
  {
    component: DataPlanePage,
    exact: false,
    label: 'Red Hat OpenShift Streams for Apache Kafka',
    path: '/openshift-streams/kafkas',
    title: 'Red Hat OpenShift Streams for Apache Kafka',
  },
  {
    component: ControlPlanePage,
    exact: true,
    label: 'Red Hat OpenShift Streams for Apache Kafka',
    path: '/openshift-streams',
    title: 'Red Hat OpenShift Streams for Apache Kafka',
  },
  {
    component: RedirectSlash,
    exact: true,
    label: 'Red Hat OpenShift Streams for Apache Kafka',
    path: '/',
    title: 'Red Hat OpenShift Streams for Apache Kafka',
  },
  {
    component: QuickStartCatalogFederated,
    exact: true,
    label: 'QuickStarts for Red Hat OpenShift Application Services',
    path: '/quickstarts',
    title: 'QuickStarts for Red Hat OpenShift Application Services',
  }
];

// a custom hook for sending focus to the primary content container
// after a view has loaded so that subsequent press of tab key
// sends focus directly to relevant content
const useA11yRouteChange = (isAsync: boolean) => {
  const lastNavigation = useLastLocation();
  React.useEffect(() => {
    if (!isAsync && lastNavigation !== null) {
      routeFocusTimer = accessibleRouteChangeHandler();
    }
    return () => {
      window.clearTimeout(routeFocusTimer);
    };
  }, [isAsync, lastNavigation]);
};

const RouteWithTitleUpdates = ({ component: Component, isAsync = false, title, ...rest }: IAppRoute) => {
  useA11yRouteChange(isAsync);
  useDocumentTitle(title);

  function routeWithTitle(routeProps: RouteComponentProps) {
    return (
      <QuickStartDrawerFederated>
        <Component {...rest} {...routeProps} />
      </QuickStartDrawerFederated>
      );
  }

  return <Route render={routeWithTitle}/>;
};

const PageNotFound = ({ title }: { title: string }) => {
  useDocumentTitle(title);
  return <Route component={NotFound}/>;
};

const flattenedRoutes: IAppRoute[] = routes.reduce(
  (flattened, route) => [...flattened, ...(route.routes ? route.routes : [route])],
  [] as IAppRoute[]
);

const AppRoutes = (): React.ReactElement => (
  <LastLocationProvider>
    <Switch>
      {flattenedRoutes.map(({ path, exact, component, title, isAsync }, idx) => (
        <RouteWithTitleUpdates
          path={path}
          exact={exact}
          component={component}
          key={idx}
          title={title}
          isAsync={isAsync}
        />
      ))}
      <PageNotFound title="404 Page Not Found"/>
    </Switch>
  </LastLocationProvider>
);

export { AppRoutes, routes };
