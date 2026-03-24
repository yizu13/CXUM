import { Icon } from "@iconify/react";


type IconType = {
    IconString: string
    Size?: number
}

export default function Iconify({IconString, Size} : IconType){
    return (
        <Icon icon={IconString} fontSize={Size}/>
    )
}