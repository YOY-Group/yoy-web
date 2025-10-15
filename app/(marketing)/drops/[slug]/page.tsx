type Props = { params: { slug: string } };
export default function Page({ params }: Props) {
  return <main>Drop Story: {params.slug}</main>;
}