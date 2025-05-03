import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layouts/sidebar";
import Header from "@/components/layouts/header";
import { 
  Users, 
  Plus, 
  Pencil, 
  Trash2, 
  Loader2, 
  Search,
  UserPlus,
  User,
  MapPin,
  Calendar,
  Code,
  Swords,
  Music,
  Volleyball,
  BookOpen,
  Camera,
  Heart,
  Globe
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Form schema for club
const clubFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
});

type ClubFormValues = z.infer<typeof clubFormSchema>;

export default function ClubsManage() {
  const { user } = useAuth();
  const isMobile = useMobile();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingClub, setEditingClub] = useState<any | null>(null);
  const [deleteClub, setDeleteClub] = useState<any | null>(null);
  
  // Fetch all clubs for admin
  const { data: clubs = [], isLoading: clubsLoading } = useQuery({
    queryKey: ["/api/admin/clubs"],
  });
  
  // Fetch club categories
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/clubs/categories"],
  });
  
  const form = useForm<ClubFormValues>({
    resolver: zodResolver(clubFormSchema),
    defaultValues: {
      name: "",
      description: "",
      category: ""
    }
  });
  
  // Create club mutation
  const createClubMutation = useMutation({
    mutationFn: async (data: ClubFormValues) => {
      return await apiRequest("POST", "/api/admin/clubs", data);
    },
    onSuccess: () => {
      toast({
        title: "Club created successfully",
        variant: "default",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/admin/clubs"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to create club",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  });
  
  // Update club mutation
  const updateClubMutation = useMutation({
    mutationFn: async (data: ClubFormValues & { id: number }) => {
      const { id, ...clubData } = data;
      return await apiRequest("PUT", `/api/admin/clubs/${id}`, clubData);
    },
    onSuccess: () => {
      toast({
        title: "Club updated successfully",
        variant: "default",
      });
      setEditingClub(null);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/clubs"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to update club",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  });
  
  // Delete club mutation
  const deleteClubMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/admin/clubs/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Club deleted successfully",
        variant: "default",
      });
      setDeleteClub(null);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/clubs"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete club",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  });
  
  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };
  
  const onSubmit = (data: ClubFormValues) => {
    if (editingClub) {
      updateClubMutation.mutate({ ...data, id: editingClub.id });
    } else {
      createClubMutation.mutate(data);
    }
  };
  
  const handleEditClub = (club: any) => {
    setEditingClub(club);
    
    form.reset({
      name: club.name,
      description: club.description,
      category: club.category,
    });
  };
  
  const handleDeleteClub = (id: number) => {
    deleteClubMutation.mutate(id);
  };
  
  // Filter clubs based on search query
  const filteredClubs = clubs.filter((club: any) => 
    club.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get club icon and color based on category
  const getClubIconColor = (category: string) => {
    const icons: Record<string, any> = {
      coding: { icon: <Code className="h-5 w-5 text-white" />, color: "bg-primary" },
      chess: { icon: <Swords className="h-5 w-5 text-white" />, color: "bg-secondary" },
      music: { icon: <Music className="h-5 w-5 text-white" />, color: "bg-accent" },
      basketball: { icon: <Volleyball className="h-5 w-5 text-white" />, color: "bg-destructive" },
      art: { icon: <Pencil className="h-5 w-5 text-white" />, color: "bg-[#10B981]" },
      literature: { icon: <BookOpen className="h-5 w-5 text-white" />, color: "bg-[#F59E0B]" },
      photography: { icon: <Camera className="h-5 w-5 text-white" />, color: "bg-[#3B82F6]" },
      volunteer: { icon: <Heart className="h-5 w-5 text-white" />, color: "bg-[#EC4899]" },
      international: { icon: <Globe className="h-5 w-5 text-white" />, color: "bg-[#8B5CF6]" },
    };
    
    return icons[category] || { icon: <Users className="h-5 w-5 text-white" />, color: "bg-primary" };
  };
  
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isMobileOpen={sidebarOpen} onCloseMobile={handleCloseSidebar} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMobileMenuToggle={handleToggleSidebar} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-16 md:pb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="font-poppins font-bold text-2xl md:text-3xl mb-2">Club Administration</h1>
              <p className="text-muted-foreground">
                Create, edit, and manage campus clubs
              </p>
            </div>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button className="mt-4 md:mt-0">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Club
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create New Club</DialogTitle>
                  <DialogDescription>
                    Fill in the details to create a new campus club.
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Club Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter club name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter club description" 
                              className="min-h-[100px]" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((category: any) => (
                                <SelectItem key={category.id} value={category.value}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button 
                        type="submit" 
                        disabled={createClubMutation.isPending || updateClubMutation.isPending}
                      >
                        {(createClubMutation.isPending || updateClubMutation.isPending) && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {editingClub ? "Update Club" : "Create Club"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              className="pl-10"
              placeholder="Search clubs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Clubs Table */}
          {clubsLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredClubs.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Club</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Members</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClubs.map((club: any) => {
                    const { icon, color } = getClubIconColor(club.category);
                    
                    return (
                      <TableRow key={club.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className={`h-10 w-10 rounded-full ${color} flex items-center justify-center`}>
                              {icon}
                            </div>
                            <div>
                              <div className="font-medium">{club.name}</div>
                              <div className="text-xs text-muted-foreground line-clamp-1">
                                {club.description}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="capitalize">{club.category}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-muted-foreground mr-1" />
                            <span>{club.memberCount || 0}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleEditClub(club)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[500px]">
                                <DialogHeader>
                                  <DialogTitle>Edit Club</DialogTitle>
                                  <DialogDescription>
                                    Update the details of this club.
                                  </DialogDescription>
                                </DialogHeader>
                                
                                <Form {...form}>
                                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <FormField
                                      control={form.control}
                                      name="name"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Club Name</FormLabel>
                                          <FormControl>
                                            <Input placeholder="Enter club name" {...field} />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    
                                    <FormField
                                      control={form.control}
                                      name="description"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Description</FormLabel>
                                          <FormControl>
                                            <Textarea 
                                              placeholder="Enter club description" 
                                              className="min-h-[100px]" 
                                              {...field} 
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    
                                    <FormField
                                      control={form.control}
                                      name="category"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Category</FormLabel>
                                          <Select 
                                            onValueChange={field.onChange} 
                                            defaultValue={field.value}
                                          >
                                            <FormControl>
                                              <SelectTrigger>
                                                <SelectValue placeholder="Select a category" />
                                              </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                              {categories.map((category: any) => (
                                                <SelectItem key={category.id} value={category.value}>
                                                  {category.name}
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    
                                    <DialogFooter>
                                      <DialogClose asChild>
                                        <Button 
                                          variant="outline" 
                                          onClick={() => setEditingClub(null)}
                                        >
                                          Cancel
                                        </Button>
                                      </DialogClose>
                                      <Button 
                                        type="submit" 
                                        disabled={updateClubMutation.isPending}
                                      >
                                        {updateClubMutation.isPending && (
                                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        )}
                                        Update Club
                                      </Button>
                                    </DialogFooter>
                                  </form>
                                </Form>
                              </DialogContent>
                            </Dialog>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="text-destructive"
                                  onClick={() => setDeleteClub(club)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete the club "{deleteClub?.name}" and all its membership records. This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel onClick={() => setDeleteClub(null)}>
                                    Cancel
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-destructive hover:bg-destructive/90"
                                    onClick={() => handleDeleteClub(deleteClub?.id)}
                                    disabled={deleteClubMutation.isPending}
                                  >
                                    {deleteClubMutation.isPending && (
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>

                            {/* Club details dialog */}
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <UserPlus className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[500px]">
                                <DialogHeader>
                                  <DialogTitle>Club Members</DialogTitle>
                                  <DialogDescription>
                                    Manage members of {club.name}
                                  </DialogDescription>
                                </DialogHeader>
                                
                                <div className="py-4">
                                  <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                      <div className={`h-10 w-10 rounded-full ${color} flex items-center justify-center`}>
                                        {icon}
                                      </div>
                                      <div>
                                        <h3 className="font-medium">{club.name}</h3>
                                        <p className="text-sm text-muted-foreground">
                                          {club.memberCount || 0} members
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <ScrollArea className="h-[300px] pr-4">
                                    <div className="text-center text-muted-foreground">
                                      <User className="h-16 w-16 mx-auto mb-3 opacity-20" />
                                      <p>Member management will be available in the next update</p>
                                    </div>
                                  </ScrollArea>
                                </div>
                                
                                <DialogFooter>
                                  <DialogClose asChild>
                                    <Button>Close</Button>
                                  </DialogClose>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-md border py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-medium text-lg mb-2">No Clubs Found</h3>
              <p className="text-muted-foreground text-center max-w-md mb-4">
                {searchQuery ? 
                  "No clubs match your search query. Try a different search term." : 
                  "You haven't created any clubs yet. Get started by creating your first club."}
              </p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Club
                  </Button>
                </DialogTrigger>
                {/* Dialog content is the same as above */}
              </Dialog>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}


