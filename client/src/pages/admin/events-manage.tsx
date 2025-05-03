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
  CalendarPlus, 
  Plus, 
  Pencil, 
  Trash2, 
  Loader2, 
  Search,
  Calendar,
  Clock,
  MapPin,
  User,
  Image
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
import { Badge } from "@/components/ui/badge";
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

// Form schema for event
const eventFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  location: z.string().min(3, "Location must be at least 3 characters"),
  imageUrl: z.string().url("Please enter a valid URL"),
  categories: z.string().min(1, "At least one category is required")
});

type EventFormValues = z.infer<typeof eventFormSchema>;

export default function EventsManage() {
  const { user } = useAuth();
  const isMobile = useMobile();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  const [deleteEvent, setDeleteEvent] = useState<any | null>(null);
  
  // Fetch all events for admin
  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ["/api/admin/events"],
  });
  
  // Fetch event categories
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/events/categories"],
  });
  
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      description: "",
      date: "",
      time: "",
      location: "",
      imageUrl: "",
      categories: ""
    }
  });
  
  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: async (data: EventFormValues) => {
      return await apiRequest("POST", "/api/admin/events", data);
    },
    onSuccess: () => {
      toast({
        title: "Event created successfully",
        variant: "default",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/admin/events"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to create event",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  });
  
  // Update event mutation
  const updateEventMutation = useMutation({
    mutationFn: async (data: EventFormValues & { id: number }) => {
      const { id, ...eventData } = data;
      return await apiRequest("PUT", `/api/admin/events/${id}`, eventData);
    },
    onSuccess: () => {
      toast({
        title: "Event updated successfully",
        variant: "default",
      });
      setEditingEvent(null);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/events"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to update event",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  });
  
  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/admin/events/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Event deleted successfully",
        variant: "default",
      });
      setDeleteEvent(null);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/events"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete event",
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
  
  const onSubmit = (data: EventFormValues) => {
    if (editingEvent) {
      updateEventMutation.mutate({ ...data, id: editingEvent.id });
    } else {
      createEventMutation.mutate(data);
    }
  };
  
  const handleEditEvent = (event: any) => {
    setEditingEvent(event);
    
    form.reset({
      title: event.title,
      description: event.description,
      date: event.date.split("T")[0], // Format date to YYYY-MM-DD
      time: event.time,
      location: event.location,
      imageUrl: event.imageUrl,
      categories: event.categories[0] || ""
    });
  };
  
  const handleDeleteEvent = (id: number) => {
    deleteEventMutation.mutate(id);
  };
  
  // Filter events based on search query
  const filteredEvents = events.filter((event: any) => 
    event.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isMobileOpen={sidebarOpen} onCloseMobile={handleCloseSidebar} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMobileMenuToggle={handleToggleSidebar} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-16 md:pb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="font-poppins font-bold text-2xl md:text-3xl mb-2">Manage Events</h1>
              <p className="text-muted-foreground">
                Create, edit, and manage campus events
              </p>
            </div>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button className="mt-4 md:mt-0">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Event
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Create New Event</DialogTitle>
                  <DialogDescription>
                    Fill in the details to create a new campus event.
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <ScrollArea className="max-h-[60vh]">
                      <div className="space-y-4 pr-4">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Event Title</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter event title" {...field} />
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
                                  placeholder="Enter event description" 
                                  className="min-h-[100px]" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Date</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                    <Input type="date" className="pl-10" {...field} />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="time"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Time</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                    <Input placeholder="e.g. 2:00 PM" className="pl-10" {...field} />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Location</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                  <Input 
                                    placeholder="Enter event location" 
                                    className="pl-10" 
                                    {...field} 
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="imageUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Image URL</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                  <Input 
                                    placeholder="Enter image URL" 
                                    className="pl-10" 
                                    {...field} 
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="categories"
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
                                      {category.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </ScrollArea>
                    
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button 
                        type="submit" 
                        disabled={createEventMutation.isPending || updateEventMutation.isPending}
                      >
                        {(createEventMutation.isPending || updateEventMutation.isPending) && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {editingEvent ? "Update Event" : "Create Event"}
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
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Events Table */}
          {eventsLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Registrations</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.map((event: any) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded bg-muted overflow-hidden">
                            <img 
                              src={event.imageUrl} 
                              alt={event.title} 
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-medium">{event.title}</div>
                            <div className="flex mt-1 space-x-1">
                              {event.categories.map((category: string, idx: number) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {category}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{new Date(event.date).toLocaleDateString()}</div>
                        <div className="text-sm text-muted-foreground">{event.time}</div>
                      </TableCell>
                      <TableCell>{event.location}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-muted-foreground mr-1" />
                          <span>{event.registrationCount || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleEditEvent(event)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[600px]">
                              <DialogHeader>
                                <DialogTitle>Edit Event</DialogTitle>
                                <DialogDescription>
                                  Update the details of this event.
                                </DialogDescription>
                              </DialogHeader>
                              
                              <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                  <ScrollArea className="max-h-[60vh]">
                                    <div className="space-y-4 pr-4">
                                      <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Event Title</FormLabel>
                                            <FormControl>
                                              <Input placeholder="Enter event title" {...field} />
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
                                                placeholder="Enter event description" 
                                                className="min-h-[100px]" 
                                                {...field} 
                                              />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                          control={form.control}
                                          name="date"
                                          render={({ field }) => (
                                            <FormItem>
                                              <FormLabel>Date</FormLabel>
                                              <FormControl>
                                                <div className="relative">
                                                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                                  <Input type="date" className="pl-10" {...field} />
                                                </div>
                                              </FormControl>
                                              <FormMessage />
                                            </FormItem>
                                          )}
                                        />
                                        
                                        <FormField
                                          control={form.control}
                                          name="time"
                                          render={({ field }) => (
                                            <FormItem>
                                              <FormLabel>Time</FormLabel>
                                              <FormControl>
                                                <div className="relative">
                                                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                                  <Input placeholder="e.g. 2:00 PM" className="pl-10" {...field} />
                                                </div>
                                              </FormControl>
                                              <FormMessage />
                                            </FormItem>
                                          )}
                                        />
                                      </div>
                                      
                                      <FormField
                                        control={form.control}
                                        name="location"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Location</FormLabel>
                                            <FormControl>
                                              <div className="relative">
                                                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                                <Input 
                                                  placeholder="Enter event location" 
                                                  className="pl-10" 
                                                  {...field} 
                                                />
                                              </div>
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      
                                      <FormField
                                        control={form.control}
                                        name="imageUrl"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Image URL</FormLabel>
                                            <FormControl>
                                              <div className="relative">
                                                <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                                <Input 
                                                  placeholder="Enter image URL" 
                                                  className="pl-10" 
                                                  {...field} 
                                                />
                                              </div>
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      
                                      <FormField
                                        control={form.control}
                                        name="categories"
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
                                                    {category.label}
                                                  </SelectItem>
                                                ))}
                                              </SelectContent>
                                            </Select>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                    </div>
                                  </ScrollArea>
                                  
                                  <DialogFooter>
                                    <DialogClose asChild>
                                      <Button 
                                        variant="outline" 
                                        onClick={() => setEditingEvent(null)}
                                      >
                                        Cancel
                                      </Button>
                                    </DialogClose>
                                    <Button 
                                      type="submit" 
                                      disabled={updateEventMutation.isPending}
                                    >
                                      {updateEventMutation.isPending && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      )}
                                      Update Event
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
                                onClick={() => setDeleteEvent(event)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete the event "{deleteEvent?.title}". This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setDeleteEvent(null)}>
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive hover:bg-destructive/90"
                                  onClick={() => handleDeleteEvent(deleteEvent?.id)}
                                  disabled={deleteEventMutation.isPending}
                                >
                                  {deleteEventMutation.isPending && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  )}
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-md border py-12">
              <CalendarPlus className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-medium text-lg mb-2">No Events Found</h3>
              <p className="text-muted-foreground text-center max-w-md mb-4">
                {searchQuery ? 
                  "No events match your search query. Try a different search term." : 
                  "You haven't created any events yet. Get started by creating your first event."}
              </p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Event
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
