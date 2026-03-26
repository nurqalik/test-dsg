"use client";
import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  MoreVertical,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { api } from "~/trpc/react";
import { toast } from "sonner";

interface Kendaraan {
  id: number;
  merk: string;
  jenis: string;
  stock: number;
  harga: number;
  keterangan: string;
}

export default function KendaraanPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedKendaraan, setSelectedKendaraan] = useState<Kendaraan | null>(
    null,
  );
  const [formData, setFormData] = useState({
    merk: "",
    jenis: "",
    stock: 0,
    harga: 0,
    keterangan: "",
  });

  const itemsPerPage = 5;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data, isLoading, refetch } = api.kendaraan.getAllKendaraan.useQuery({
    page: currentPage,
    limit: itemsPerPage,
    searchQuery: debouncedSearch,
  });

  const createMutation = api.kendaraan.create.useMutation({
    onSuccess: () => {
      toast.success("Produk berhasil ditambahkan");
      setIsCreateOpen(false);
      void refetch();
      resetForm();
    },
    onError: (err) => toast.error(err.message),
  });

  const updateMutation = api.kendaraan.updateKendaraan.useMutation({
    onSuccess: () => {
      toast.success("Produk berhasil diupdate");
      setIsEditOpen(false);
      setSelectedKendaraan(null);
      void refetch();
      resetForm();
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = api.kendaraan.deleteKendaraan.useMutation({
    onSuccess: () => {
      toast.success("Produk berhasil dihapus");
      setIsDeleteOpen(false);
      setSelectedKendaraan(null);
      void refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const allKendaraan = data?.items ?? [];
  const totalItems = data?.total ?? 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;

  const handleEdit = (kendaraan: Kendaraan) => {
    setSelectedKendaraan(kendaraan);
    setFormData({
      merk: kendaraan.merk,
      jenis: kendaraan.jenis,
      stock: kendaraan.stock,
      harga: kendaraan.harga,
      keterangan: kendaraan.keterangan,
    });
    setIsEditOpen(true);
  };

  const handleDelete = (kendaraan: Kendaraan) => {
    setSelectedKendaraan(kendaraan);
    setIsDeleteOpen(true);
  };

  const resetForm = () => {
    setFormData({
      merk: "",
      jenis: "",
      stock: 0,
      harga: 0,
      keterangan: "",
    });
  };

  const handleSave = () => {
    if (selectedKendaraan) {
      updateMutation.mutate({
        id: selectedKendaraan.id,
        ...formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="border-border border-b">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-foreground text-3xl font-bold">
                Manajemen Produk
              </h1>
              <p className="text-muted-foreground mt-2 text-sm">
                Kelola inventori kendaraan Anda dengan mudah
              </p>
            </div>

            {/* Search and Create Section */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
                <Input
                  placeholder="Cari berdasarkan merk, jenis, atau keterangan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                onClick={() => {
                  resetForm();
                  setIsCreateOpen(true);
                }}
                className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
              >
                <Plus className="h-4 w-4" />
                Tambah Produk
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="border-border bg-card rounded-lg border">
          {/* Table */}
          <div className="relative min-h-[400px] overflow-x-auto">
            {(isLoading || deleteMutation.isPending) && (
              <div className="bg-background/50 absolute inset-0 z-10 flex items-center justify-center backdrop-blur-[1px]">
                <Loader2 className="text-primary h-8 w-8 animate-spin" />
              </div>
            )}
            <Table>
              <TableHeader>
                <TableRow className="border-border border-b hover:bg-transparent">
                  <TableHead className="text-foreground font-semibold">
                    No
                  </TableHead>
                  <TableHead className="text-foreground font-semibold">
                    Id
                  </TableHead>
                  <TableHead className="text-foreground h-12 font-semibold">
                    Merk
                  </TableHead>
                  <TableHead className="text-foreground font-semibold">
                    Jenis
                  </TableHead>
                  <TableHead className="text-foreground text-right font-semibold">
                    Stock
                  </TableHead>
                  <TableHead className="text-foreground text-right font-semibold">
                    Harga
                  </TableHead>
                  <TableHead className="text-foreground font-semibold">
                    Keterangan
                  </TableHead>
                  <TableHead className="text-foreground text-center font-semibold">
                    Aksi
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allKendaraan.length > 0 ? (
                  allKendaraan.map((kendaraan, index) => (
                    <TableRow
                      key={kendaraan.id}
                      className="border-border hover:bg-muted/50 border-b"
                    >
                      <TableCell className="text-foreground font-medium">
                        {index + 1}
                      </TableCell>
                      <TableCell className="text-foreground font-medium">
                        {kendaraan.id}
                      </TableCell>
                      <TableCell className="text-foreground">
                        {kendaraan.merk}
                      </TableCell>
                      <TableCell className="text-foreground">
                        {kendaraan.jenis}
                      </TableCell>
                      <TableCell className="text-foreground text-right">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                            kendaraan.stock > 0
                              ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-200"
                              : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-200"
                          }`}
                        >
                          {kendaraan.stock}
                        </span>
                      </TableCell>
                      <TableCell className="text-foreground text-right font-semibold">
                        {formatCurrency(kendaraan.harga)}
                      </TableCell>
                      <TableCell className="text-foreground">
                        {kendaraan.keterangan}
                      </TableCell>
                      <TableCell className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Buka menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEdit(kendaraan)}
                              className="gap-2"
                            >
                              <Edit2 className="h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(kendaraan)}
                              className="text-destructive focus:text-destructive gap-2"
                            >
                              <Trash2 className="h-4 w-4" />
                              Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-muted-foreground h-24 text-center"
                    >
                      Tidak ada data ditemukan.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Footer */}
          <div className="border-border flex items-center justify-between border-t px-4 py-4 sm:px-6">
            <div className="text-muted-foreground text-sm">
              Menampilkan {totalItems > 0 ? startIndex + 1 : 0} hingga{" "}
              {Math.min(startIndex + itemsPerPage, totalItems)} dari{" "}
              {totalItems} produk
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1 || isLoading}
              >
                <ChevronLeft className="h-4 w-4" />
                Sebelumnya
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      disabled={isLoading}
                      className="h-8 w-8 p-0"
                    >
                      {page}
                    </Button>
                  ),
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={
                  currentPage === totalPages || totalPages === 0 || isLoading
                }
              >
                Selanjutnya
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Dialog
        open={isCreateOpen || isEditOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateOpen(false);
            setIsEditOpen(false);
            setSelectedKendaraan(null);
            resetForm();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedKendaraan ? "Edit Produk" : "Tambah Produk Baru"}
            </DialogTitle>
            <DialogDescription>
              {selectedKendaraan
                ? "Ubah informasi produk kendaraan"
                : "Isi form di bawah untuk menambahkan produk kendaraan baru"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-foreground text-sm font-medium">
                Merk
              </label>
              <Input
                placeholder="Contoh: Toyota"
                value={formData.merk}
                onChange={(e) =>
                  setFormData({ ...formData, merk: e.target.value })
                }
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-foreground text-sm font-medium">
                Jenis
              </label>
              <Input
                placeholder="Contoh: SUV"
                value={formData.jenis}
                onChange={(e) =>
                  setFormData({ ...formData, jenis: e.target.value })
                }
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-foreground text-sm font-medium">
                  Stock
                </label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      stock: parseInt(e.target.value) || 0,
                    })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-foreground text-sm font-medium">
                  Harga
                </label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.harga}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      harga: parseInt(e.target.value) || 0,
                    })
                  }
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <label className="text-foreground text-sm font-medium">
                Keterangan
              </label>
              <Input
                placeholder="Contoh: Fortuner 2.8 Diesel"
                value={formData.keterangan}
                onChange={(e) =>
                  setFormData({ ...formData, keterangan: e.target.value })
                }
                className="mt-1"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                disabled={createMutation.isPending || updateMutation.isPending}
                onClick={() => {
                  setIsCreateOpen(false);
                  setIsEditOpen(false);
                  setSelectedKendaraan(null);
                  resetForm();
                }}
              >
                Batal
              </Button>
              <Button
                onClick={handleSave}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[120px]"
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : selectedKendaraan ? (
                  "Simpan Perubahan"
                ) : (
                  "Tambah Produk"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Produk?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus produk{" "}
              <span className="text-foreground font-semibold">
                {selectedKendaraan?.merk} {selectedKendaraan?.jenis}
              </span>
              ? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-2">
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (selectedKendaraan) {
                  deleteMutation.mutate({ id: selectedKendaraan.id });
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 min-w-[80px]"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Hapus"
              )}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}