import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Profile(): JSX.Element {
  return (
    <div className="bg-card border rounded-xl overflow-hidden min-w-[28rem]">
      <div className="bg-primary w-full h-60"></div>

      <div className="flex flex-col items-center w-full">
        <Avatar className="w-32 h-32 shadow -mt-16">
          <AvatarImage src="" />
          <AvatarFallback className="bg-foreground text-primary-foreground font-jost-medium text-5xl">
            CN
          </AvatarFallback>
        </Avatar>

        <div className="py-4">
          <p className="font-jost-semibold text-xl">My Name</p>
          <p className="text-foreground/75">St. Section</p>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-jost-semibold px-8 py-4 bg-background-2">
          Rating
        </h2>
        <div className="px-8 py-4 flex gap-8 w-full">
          <div className="flex items-center gap-4 w-full">
            <RankBadge />
            <div className="flex flex-col">
              <span className="font-jost-medium text-foreground/75">
                Grandmaster
              </span>
              <span className="font-jost-bold text-xl">143 pts.</span>
            </div>
          </div>

          <div className="flex flex-col">
            <span className="font-jost-medium text-foreground/75">Overall</span>
            <span className="font-jost-bold text-xl">#1</span>
          </div>

          <div className="flex flex-col">
            <span className="font-jost-medium text-foreground/75">Section</span>
            <span className="font-jost-bold text-xl">#1</span>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-jost-semibold px-8 py-4 bg-background-2">
          Badges
        </h2>

        <div className="px-8 py-4">Badges here</div>
      </div>
    </div>
  );
}

function RankBadge(): JSX.Element {
  return (
    <div className="w-10 h-10 rotate-45 border-4 border-background bg-accent"></div>
  );
}
