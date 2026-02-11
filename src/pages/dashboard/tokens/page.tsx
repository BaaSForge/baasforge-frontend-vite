"use client";

import { useMemo, useState } from "react";
import { PageTitleBox } from "@/components/page-title-box";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetTokensQuery, useDeleteTokensMutation } from "@/modules/auth";
import { Loader2Icon, Trash2Icon } from "lucide-react";
import { formatDateTimeMedium } from "@/utils/time";

export default function DashboardTokensPage() {
  const { data: tokens = [], isLoading } = useGetTokensQuery();
  const deleteMutation = useDeleteTokensMutation();
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const selectedList = useMemo(() => Array.from(selected), [selected]);
  const allSelected = tokens.length > 0 && selected.size === tokens.length;
  const someSelected = selected.size > 0;

  const toggleOne = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(tokens.map((t) => t.id)));
  };

  const handleDeleteSelected = () => {
    if (selectedList.length === 0) return;
    deleteMutation.mutate(selectedList, {
      onSuccess: () => setSelected(new Set()),
    });
  };

  return (
    <section className="flex flex-1 flex-col gap-4">
      <PageTitleBox
        title="Sessions & tokens"
        tools={
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteSelected}
            disabled={!someSelected || deleteMutation.isPending}
          >
            {deleteMutation.isPending ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <Trash2Icon className="size-4" />
            )}
            <span className="ml-1.5">
              {someSelected
                ? `Delete ${selectedList.length} selected`
                : "Delete selected"}
            </span>
          </Button>
        }
      />
      <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 mx-4">
        <div className="overflow-x-auto">
          {isLoading ? (
            <p className="text-muted-foreground py-8 text-center text-sm">
              Loading…
            </p>
          ) : tokens.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center text-sm">
              No tokens found.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={toggleAll}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Expires</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tokens.map((token) => (
                  <TableRow key={token.id}>
                    <TableCell>
                      <Checkbox
                        checked={selected.has(token.id)}
                        onCheckedChange={() => toggleOne(token.id)}
                        aria-label={`Select token ${token.id}`}
                      />
                    </TableCell>
                    <TableCell>{formatDateTimeMedium(token.created_at)}</TableCell>
                    <TableCell>{formatDateTimeMedium(token.expires_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </section>
  );
}
