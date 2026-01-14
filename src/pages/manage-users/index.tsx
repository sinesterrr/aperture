import { Plus } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";

// Mock data
const mockUsers = [
  { id: 1, name: "Admin", image: "https://github.com/shadcn.png" },
  { id: 2, name: "Alice", image: "https://brokenlink.com/image.png" },
  { id: 3, name: "Bob", image: "" },
  { id: 4, name: "Charlie", image: "" },
  { id: 5, name: "David", image: "" },
];

export default function ManageUsersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        <button
          className="group cursor-pointer flex flex-col items-center justify-center gap-3 transition-transform hover:scale-105 focus:outline-none"
          onClick={() => {
            // TODO: Implement add user modal/navigation
            console.log("Add new user clicked");
          }}
        >
          <div className="flex h-32 w-32 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/30 bg-muted/20 transition-colors group-hover:border-primary group-hover:bg-primary/10">
            <Plus className="h-12 w-12 text-muted-foreground/50 transition-colors group-hover:text-primary" />
          </div>
          <span className="text-base font-medium text-muted-foreground transition-colors group-hover:text-primary">
            Add New User
          </span>
        </button>

        {mockUsers.map((user) => (
          <div
            key={user.id}
            className="group flex flex-col items-center justify-center gap-3 transition-transform hover:scale-105 cursor-pointer"
          >
            <Avatar className="h-32 w-32 border-2 border-transparent ring-offset-background transition-all group-hover:border-primary group-hover:ring-2 group-hover:ring-primary/20 group-hover:ring-offset-2">
              <AvatarImage src={user.image} alt={user.name} />
              <AvatarFallback className="text-3xl font-semibold bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                {user.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-base font-medium text-foreground transition-colors group-hover:text-primary">
              {user.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
