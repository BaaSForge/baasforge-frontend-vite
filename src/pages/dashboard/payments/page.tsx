"use client";

import { PageTitleBox } from "@/components/page-title-box";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePaymentsQuery } from "@/modules/payment";
import { Badge } from "@/components/ui/badge";
import { TrialBadge } from "@/modules/payment/components/trial-badge";


function formatAmount(amount: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

type ExpiryInfo =
  | { type: "no_date" }
  | { type: "expired" }
  | { type: "active"; days: number };

function getExpiryInfo(expiresAt: string | null): ExpiryInfo {
  if (!expiresAt) return { type: "no_date" };
  const now = new Date();
  const expiry = new Date(expiresAt);
  const days = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (days < 0) return { type: "expired" };
  return { type: "active", days };
}

export default function DashboardPaymentsPage() {
  const { data: payments = [], isLoading } = usePaymentsQuery();

  return (
    <section className="flex flex-1 flex-col gap-4 p-4">
      <PageTitleBox title="Payments" />
      <div className="flex flex-col gap-4 rounded-xl border bg-card p-4">
        <div className="overflow-x-auto">
          {isLoading ? (
            <p className="text-muted-foreground py-8 text-center text-sm">
              Loading…
            </p>
          ) : payments.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center text-sm">
              No payments found.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Amount</TableHead>
                  <TableHead>Package</TableHead>
                  <TableHead>Trial</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expires</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => {
                  const expiry = getExpiryInfo(payment.expires_at);
                  return (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {formatAmount(payment.amount)}
                      </TableCell>
                      <TableCell>
                        {payment.package_title ?? "—"}
                        {payment.package_price != null && (
                          <span className="text-muted-foreground ml-1 text-xs">
                            ({formatAmount(payment.package_price)}
                            {payment.package_discount != null &&
                              payment.package_discount > 0 && (
                                <>, {payment.package_discount}% off</>
                              )}
                            )
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {payment.package_is_tiral ? (
                          <TrialBadge />
                        ) : (
                          <span className="text-muted-foreground inline-flex items-center gap-1 text-sm">
                            No
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={payment.is_success ? "default" : "secondary"}
                        >
                          {payment.is_success ? "Success" : "Failed"}
                        </Badge>
                      </TableCell>
                      <TableCell className="space-y-1">
                        {expiry.type === "no_date" && (
                          <span className="text-muted-foreground text-xs">
                            No expiry
                          </span>
                        )}
                        {expiry.type === "expired" && (
                          <Badge variant="destructive" className="text-xs">
                            Expired
                          </Badge>
                        )}
                        {expiry.type === "active" && (
                          <Badge
                            variant={expiry.days <= 3 ? "destructive" : "secondary"}
                            className="text-xs"
                          >
                            {expiry.days === 0
                              ? "Expires today"
                              : expiry.days === 1
                                ? "1 day left"
                                : `${expiry.days} days left`}
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </section>
  );
}
