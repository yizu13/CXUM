import { Icon } from "@iconify/react";


interface IconType {
    IconString: string
    Size?: number
    Color?: string
    Style? : object
}

export default function Iconify({IconString, Size, Color, Style} : IconType){
    return (
        <Icon icon={IconString} fontSize={Size} color={Color} style={Style}/>
    )
}