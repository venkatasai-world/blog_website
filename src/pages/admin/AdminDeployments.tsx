import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminDeployments() {
  return (
    <AdminLayout>
      <div className="max-w-4xl space-y-8">
        <div className="space-y-3">
          <h1 className="font-display text-2xl font-bold text-blog-heading">Manage Deployments</h1>
          <p className="font-body text-sm text-muted-foreground">
            Learn how to manage your Vercel deployments from the dashboard, including filtering, deleting, protecting, and redeploying.
          </p>
        </div>

        <section className="bg-card border border-border rounded-3xl p-6 space-y-4">
          <h2 className="font-display text-lg font-semibold text-blog-heading">From the Dashboard</h2>
          <p className="font-body text-sm text-muted-foreground">
            To manage your deployments from the Vercel dashboard:
          </p>
          <ol className="list-decimal list-inside space-y-2 font-body text-sm text-foreground">
            <li>Ensure your team is selected in the team switcher.</li>
            <li>Select your project.</li>
            <li>Open <strong>Deployments</strong> in the sidebar.</li>
            <li>Filter, redeploy, or manually promote the deployment to production.</li>
          </ol>
        </section>

        <section className="bg-card border border-border rounded-3xl p-6 space-y-4">
          <h2 className="font-display text-lg font-semibold text-blog-heading">Filter deployments</h2>
          <p className="font-body text-sm text-muted-foreground">
            Use the deployment filters to narrow results by branch, date range, environment, or status.
          </p>
          <ul className="list-disc list-inside space-y-2 font-body text-sm text-foreground">
            <li>Select your project from the dashboard.</li>
            <li>Open <strong>Deployments</strong> in the sidebar.</li>
            <li>Use the dropdowns to search by <strong>Branch</strong>, <strong>Date Range</strong>, <strong>All Environments</strong>, or <strong>Status</strong>.</li>
          </ul>
        </section>

        <section className="bg-card border border-border rounded-3xl p-6 space-y-4">
          <h2 className="font-display text-lg font-semibold text-blog-heading">Delete a deployment</h2>
          <p className="font-body text-sm text-muted-foreground">
            If a deployment is no longer needed, delete it from the project to remove it from the deployment list.
          </p>
          <ol className="list-decimal list-inside space-y-2 font-body text-sm text-foreground">
            <li>Open the project in the dashboard.</li>
            <li>Go to <strong>Deployments</strong>.</li>
            <li>Find the deployment you want to delete.</li>
            <li>Click the <strong>...</strong> button and choose <strong>Delete</strong>.</li>
          </ol>
          <p className="font-body text-xs text-muted-foreground">
            Deleting a deployment removes its instant rollback option and may break integration links, such as pull request previews.
          </p>
        </section>

        <section className="bg-card border border-border rounded-3xl p-6 space-y-4">
          <h2 className="font-display text-lg font-semibold text-blog-heading">Retention policy</h2>
          <p className="font-body text-sm text-muted-foreground">
            Set a deployment retention policy to automatically delete older deployments after a defined period.
          </p>
          <p className="font-body text-sm text-foreground">
            This helps keep your project clean and removes deployments you no longer need without manual deletion.
          </p>
        </section>

        <section className="bg-card border border-border rounded-3xl p-6 space-y-4">
          <h2 className="font-display text-lg font-semibold text-blog-heading">Deployment protection</h2>
          <p className="font-body text-sm text-muted-foreground">
            Protect your deployments from unauthorized access by enabling Vercel Authentication and restricting access to authorized users.
          </p>
          <ul className="list-disc list-inside space-y-2 font-body text-sm text-foreground">
            <li>Use Vercel Authentication to restrict deployments to users with access rights.</li>
            <li>Configure protected environments for production or preview deployments.</li>
            <li>Enterprise teams can also use Trusted IPs and Password Protection.</li>
          </ul>
          <p className="font-body text-xs text-muted-foreground">
            Password protection is available as a paid add-on for Pro teams.</p>
        </section>

        <section className="bg-card border border-border rounded-3xl p-6 space-y-4">
          <h2 className="font-display text-lg font-semibold text-blog-heading">Redeploy a project</h2>
          <p className="font-body text-sm text-muted-foreground">
            Manually redeploy when you need to refresh cached data or apply settings changes.
          </p>
          <ol className="list-decimal list-inside space-y-2 font-body text-sm text-foreground">
            <li>Select your team and project in the dashboard.</li>
            <li>Open <strong>Deployments</strong> and locate the target deployment.</li>
            <li>Click the ellipsis icon and choose <strong>Redeploy</strong>.</li>
            <li>Choose whether to keep the existing build cache and confirm the redeploy.</li>
          </ol>
        </section>

        <section className="bg-card border border-border rounded-3xl p-6 space-y-4">
          <h2 className="font-display text-lg font-semibold text-blog-heading">When to redeploy</h2>
          <p className="font-body text-sm text-muted-foreground">
            Redeploying is useful when you want to ensure your app picks up important changes or recovers from transient issues.
          </p>
          <ul className="list-disc list-inside space-y-2 font-body text-sm text-foreground">
            <li>Enabling analytics.</li>
            <li>Updating environment variables.</li>
            <li>Improving outage resiliency.</li>
            <li>Applying build or development setting changes.</li>
          </ul>
        </section>
      </div>
    </AdminLayout>
  );
}
