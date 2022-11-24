import Image from "next/image";

export default function Step(props){

    return (
        <li className="step step-primary">
            <div className="text-left py-1">
                <h2 className={"text-primary"}>{props.title}</h2>
                {props.children}
                { props.img && (
                    <div className={"w-full md:w-2/3"}>
                        <Image src={props.img} className={"rounded-3xl"}></Image>
                    </div>
                )}
            </div>
        </li>
    );
}