"use client";

import { Switch } from "@/components/ui/switch";

<<<<<<< HEAD
=======
import { Button } from "@/components/ui/button";
>>>>>>> cebe80e (New Update)
import {
  NativeSelect,
  NativeSelectOptGroup,
  NativeSelectOption,
} from "@/components/ui/native-select";
<<<<<<< HEAD

import { Button } from "@/components/ui/button"


=======

>>>>>>> cebe80e (New Update)

import { ShoppingCart, Search, User, MapPinHouse, Heart } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import Image from "next/image";

import React, { useState } from "react";
import { ModeToggle } from "../Darkmode/darkMode";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function Navbar() {

<<<<<<< HEAD
const pathName=usePathname();
=======
  const pathName = usePathname();
>>>>>>> cebe80e (New Update)

  const [isEnglish, setIsEnglish] = useState(true);
  return (
    <>
      <div className="shadow-lg  top-0 z-50 bg-white dark:bg-black ">
        <div className="container mx-auto py-2">
          <nav className="grid  grid-cols-3 items-center">
            <div className=" grid grid-cols-2 gap-5 ">

              <Link href='/'> <Image
                src={"/Image/logo.png"}
                alt="I-Technology"
                width={200}
                height={200}
              /></Link>
<<<<<<< HEAD
=======
             
>>>>>>> cebe80e (New Update)

              <Dialog>
                <form>
                  <DialogTrigger
                    render={
                      <Button variant="outline">
                        <MapPinHouse className="text-[#0497D8]" />
                        Store Location
                      </Button>
                    }
                  />
                  <DialogContent className="sm:max-w-fit ">
                    <DialogHeader>
                      <DialogTitle>Location Store</DialogTitle>
                      <DialogDescription>
                        <iframe
                          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3451.0385874493927!2d31.3310175!3d30.1217093!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x145815b80eca7a8f%3A0x3cd44d697df321cf!2sI-Technology!5e0!3m2!1sar!2seg!4v1785959031557!5m2!1sar!2seg"
                          width="600"
                          height="450"
                          className="border-0"
                          loading="lazy"
                        ></iframe>
                      </DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                      <Button
                        type="button"
                        className="bg-[#0497D8] "
                        onClick={() =>
                          window.open(
                            "https://www.google.com/maps/dir/?api=1&destination=30.1217093,31.3310175",
                            "_blank",
                          )
                        }
                      >
                        Go to Store
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </form>
              </Dialog>
            </div>

            <div>
              <Field orientation="horizontal">
                <Input type="search" placeholder="Search..." />
                <Button className="bg-[#0497D8]">
                  <Search className="text-white" />
                </Button>
              </Field>
            </div>

            <div className="flex  items-center gap-6 justify-center">
              <ModeToggle />
              <div className="flex items-center space-x-2">
                <Switch
                  id="lang"
                  checked={isEnglish}
                  onCheckedChange={setIsEnglish}
                />

                  {isEnglish && (
                  <Image
                  src="/Image/us-flag.webp"
                  height={20}
                  width={20}
                  alt="ar"
                />
                )}
<<<<<<< HEAD

=======
                    {!isEnglish && (

                  <Image
                    src="/Image/ar-flag.webp"
                    height={20}
                    width={20}
                    alt="ar"
                  />
                )}
>>>>>>> cebe80e (New Update)
              </div>
              <Heart className="text-[#0497D8]" />
              <ShoppingCart className="text-[#0497D8]" />
              <Dialog>
                <form>
                  <DialogTrigger
                    render={
                      <Button variant="outline">
                        <User />
                        Sign In
                      </Button>
                    }
                  />
                  <DialogContent className="sm:max-w-[25%]">
                    <DialogHeader>
                      <DialogTitle>Login</DialogTitle>
<<<<<<< HEAD

=======
>>>>>>> cebe80e (New Update)
                      <DialogDescription>
                        Welcome 👋
                      </DialogDescription>

                    </DialogHeader>
                    <FieldGroup>
                      <Field>
                        <Label htmlFor="Email">Email</Label>
                        <Input
                          id="Email"
                          name="Email"
                          placeholder="your@company.com"
                        />
                      </Field>
                      <Field>
                        <Label htmlFor="Password">Password</Label>
<<<<<<< HEAD

                        <Input id="Password" name="Password" type="password" />
                      </Field>

                      <Button type="submit" className="bg-[#0497DB]">
                        Login
                      </Button>
                    </FieldGroup>
                    <DialogFooter>
                      <Button type="submit" className="bg-[#0497DB]">
                        SignUp
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </form>
              </Dialog>
            </div>
          </nav>
        </div>
  

=======

                        <Input
                          id="Password"
                          name="Password"
                          type="password"
                        />
                      </Field>

                      <Button type="submit" className='bg-[#0497DB]'>Login</Button>
                    </FieldGroup>
                    <DialogFooter>
                      <Button type="submit" className='bg-[#0497DB]'>SignUp</Button>
                    </DialogFooter>
                  </DialogContent>
                  
                </form>
              </Dialog>
            </div>

          </nav>

        </div>

>>>>>>> cebe80e (New Update)
        <div className="container mx-auto py-2 pt-3 flex gap-3">
          <NavigationMenu className="border-r-[1.5px] pr-2">
            <NavigationMenuList>
              <NavigationMenuItem>
<<<<<<< HEAD
=======

>>>>>>> cebe80e (New Update)
                <NavigationMenuTrigger><Link href={"/products/" + 66}>Mobiles</Link></NavigationMenuTrigger>
                <NavigationMenuContent className="flex  flex-col item-center justify-around ">
                  <NavigationMenuLink>Smart Phones</NavigationMenuLink>
                  <NavigationMenuLink>Feature Phone</NavigationMenuLink>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>

          </NavigationMenu>

          <NavigationMenu className="border-r-[1.5px] pr-2">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger><Link href={"/products/" + 131}>Accessories</Link></NavigationMenuTrigger>
                <NavigationMenuContent className="flex  flex-col item-center justify-around ">
                  <NavigationMenu >
                    <NavigationMenuList >
                      <NavigationMenuItem >
                        <NavigationMenuTrigger>Audio</NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <NavigationMenuLink>Graphic Cards</NavigationMenuLink>
                          <NavigationMenuLink>Processor</NavigationMenuLink>
                          <NavigationMenuLink>RAM</NavigationMenuLink>
                          <NavigationMenuLink>Mother Boards</NavigationMenuLink>
                          <NavigationMenuLink>Cases</NavigationMenuLink>
                          <NavigationMenuLink>Fan&Cooling</NavigationMenuLink>
                        </NavigationMenuContent>
                      </NavigationMenuItem>
                    </NavigationMenuList>
                  </NavigationMenu>
                  <NavigationMenu>
                    <NavigationMenuList>
                      <NavigationMenuItem>
                        <NavigationMenuTrigger>
                          Computer Accessories
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <NavigationMenuLink>Graphic Cards</NavigationMenuLink>
                          <NavigationMenuLink>Processor</NavigationMenuLink>
                          <NavigationMenuLink>RAM</NavigationMenuLink>
                          <NavigationMenuLink>Mother Boards</NavigationMenuLink>
                          <NavigationMenuLink>Cases</NavigationMenuLink>
                          <NavigationMenuLink>Fan&Cooling</NavigationMenuLink>
                        </NavigationMenuContent>
                      </NavigationMenuItem>
                    </NavigationMenuList>
                  </NavigationMenu>
                  <NavigationMenu>
                    <NavigationMenuList>
                      <NavigationMenuItem>
                        <NavigationMenuTrigger>
                          Mobile Accessories
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <NavigationMenuLink>Graphic Cards</NavigationMenuLink>
                          <NavigationMenuLink>Processor</NavigationMenuLink>
                          <NavigationMenuLink>RAM</NavigationMenuLink>
                          <NavigationMenuLink>Mother Boards</NavigationMenuLink>
                          <NavigationMenuLink>Cases</NavigationMenuLink>
                          <NavigationMenuLink>Fan&Cooling</NavigationMenuLink>
                        </NavigationMenuContent>
                      </NavigationMenuItem>
                    </NavigationMenuList>
                  </NavigationMenu>
                  <NavigationMenuLink>Car Accessories</NavigationMenuLink>
                  <NavigationMenu>
                    <NavigationMenuList>
                      <NavigationMenuItem>
                        <NavigationMenuTrigger>
                          Mobile Accessories
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <NavigationMenuLink>Graphic Cards</NavigationMenuLink>
                          <NavigationMenuLink>Processor</NavigationMenuLink>
                          <NavigationMenuLink>RAM</NavigationMenuLink>
                          <NavigationMenuLink>Mother Boards</NavigationMenuLink>
                          <NavigationMenuLink>Cases</NavigationMenuLink>
                          <NavigationMenuLink>Fan&Cooling</NavigationMenuLink>
                        </NavigationMenuContent>
                      </NavigationMenuItem>
                    </NavigationMenuList>
                  </NavigationMenu>
                  <NavigationMenuLink>Smart Devices</NavigationMenuLink>
                  <NavigationMenuLink>Batteries</NavigationMenuLink>
                  <NavigationMenuLink>Power</NavigationMenuLink>
<<<<<<< HEAD
=======

>>>>>>> cebe80e (New Update)
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>


          <NavigationMenu className="border-r-[1.5px] pr-2">
            <NavigationMenuList>
              <NavigationMenuItem>

                <NavigationMenuTrigger><Link href={"/products/" + 54}>Laptop&PC</Link> </NavigationMenuTrigger>
                <NavigationMenuContent className="flex flex-col item-center justify-around ">
                  <NavigationMenuLink>Desktops</NavigationMenuLink>
                  <NavigationMenuLink>Laptops</NavigationMenuLink>
                  <NavigationMenu>
                    <NavigationMenuList>
                      <NavigationMenuItem>
                        <NavigationMenuTrigger>
                          Computer Parts
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <NavigationMenuLink>Graphic Cards</NavigationMenuLink>
                          <NavigationMenuLink>Processor</NavigationMenuLink>
                          <NavigationMenuLink>RAM</NavigationMenuLink>
                          <NavigationMenuLink>Mother Boards</NavigationMenuLink>
                          <NavigationMenuLink>Cases</NavigationMenuLink>
                          <NavigationMenuLink>Fan&Cooling</NavigationMenuLink>
                        </NavigationMenuContent>
                      </NavigationMenuItem>
                    </NavigationMenuList>
                  </NavigationMenu>
                  <NavigationMenuLink>Monitors</NavigationMenuLink>

<<<<<<< HEAD
       
=======
>>>>>>> cebe80e (New Update)
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>


          <NavigationMenu className="border-r-[1.5px] pr-2">
            <NavigationMenuList>
              <NavigationMenuItem>

                <NavigationMenuTrigger><Link href={"/products/" + 948}>Gaming</Link></NavigationMenuTrigger>
                <NavigationMenuContent className="flex flex-col  item-center justify-around ">
                  <NavigationMenuLink>Gaming CD</NavigationMenuLink>
                  <NavigationMenuLink>Gamepad & Controller</NavigationMenuLink>

                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>


          <NavigationMenu className="border-r-[1.5px] pr-2">
            <NavigationMenuList>
              <NavigationMenuItem>
<<<<<<< HEAD

=======
>>>>>>> cebe80e (New Update)
                <NavigationMenuTrigger><Link href={"/products/" + 71}>Network</Link></NavigationMenuTrigger>
                <NavigationMenuContent className="flex flex-col  item-center justify-around ">
                  <NavigationMenuLink>Gaming CD</NavigationMenuLink>
                  <NavigationMenuLink>Gamepad & Controller</NavigationMenuLink>

                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>


          <NavigationMenu className="border-r-[1.5px] pr-2">
            <NavigationMenuList>
              <NavigationMenuItem>

                <NavigationMenuLink render={<Link href={"/products/"+1843}>Home Appliances</Link>}/>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>


          <NavigationMenu className="border-r-[1.5px] pr-2">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink
                  render={<Link  href={"/products/"+2313}>Security Systems</Link>}
                />
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>


          <NavigationMenu className="border-r-[1.5px] pr-2">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink render={<Link  href={"/products/"+17}>Tools</Link>} />
<<<<<<< HEAD
=======

>>>>>>> cebe80e (New Update)
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>


          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link href={"/products/"+1922}>
                <NavigationMenuTrigger className="w-full  bg-[#ec6c0380]">
                  <Image
                    src="/Image/cropped-2022logo-small.png"
                    alt=""
                    height={90}
                    width={90}
                    className="w-full"
                  />
                </NavigationMenuTrigger>
                </Link>
                <NavigationMenuContent>
                  <NavigationMenuLink>Case</NavigationMenuLink>
                  <NavigationMenuLink>Power Supply</NavigationMenuLink>
                  <NavigationMenuLink>Mouse</NavigationMenuLink>
                  <NavigationMenuLink>Keyboard</NavigationMenuLink>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>
    </>
  );
}
