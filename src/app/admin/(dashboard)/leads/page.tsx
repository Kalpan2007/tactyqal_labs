import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

/** Consultation requests submitted through the homepage form. */
export default async function AdminLeads() {
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 100 });

  return (
    <>
      <h1 className="display text-4xl">Consultation requests</h1>
      <p className="mt-2 text-sm text-mute">
        {leads.length === 0 ? "Nothing yet." : `${leads.length} most recent`}
      </p>

      {leads.length > 0 && (
        <div className="mt-8 overflow-x-auto rounded-xl border border-rule bg-snow">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Consultation requests, newest first</caption>
            <thead className="border-b border-rule text-xs text-mute">
              <tr>
                <th scope="col" className="px-5 py-3 font-medium">Name</th>
                <th scope="col" className="px-5 py-3 font-medium">Contact</th>
                <th scope="col" className="px-5 py-3 font-medium">Age</th>
                <th scope="col" className="px-5 py-3 font-medium">Idea</th>
                <th scope="col" className="px-5 py-3 font-medium">Received</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-b border-rule last:border-0">
                  <td className="px-5 py-4 font-medium">{lead.parentName}</td>
                  <td className="px-5 py-4 text-mute">
                    <a href={`mailto:${lead.email}`} className="underline decoration-gold underline-offset-4">
                      {lead.email}
                    </a>
                    <span className="mt-1 block">{lead.phone}</span>
                  </td>
                  <td className="px-5 py-4 text-mute">{lead.studentAge}</td>
                  <td className="max-w-sm px-5 py-4 text-mute">{lead.idea || "—"}</td>
                  <td className="px-5 py-4 whitespace-nowrap text-mute">{formatDate(lead.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
