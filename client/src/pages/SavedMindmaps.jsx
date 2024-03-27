import React, { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { Button, Card, CardBody, CardFooter, Image } from "@nextui-org/react";
import Loader from "../components/Loader";
import axios from "../axios.js";
import { toast } from "react-hot-toast";
import { IoSaveOutline } from "react-icons/io5";
import { IoOpenOutline } from "react-icons/io5";
import { Link } from "react-router-dom";

const SavedMindmaps = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [mindmaps, setMindmaps] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      try {
        const res = await axios.get("/mindmap/get");
        setMindmaps(res.data);
        console.log(mindmaps);
        // toast.success("All the Mindmaps fetched!");
        setIsLoading(false);
      } catch (err) {
        console.error(err);
        toast.error("Server error please try again later");
        setIsLoading(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData()
  }, []);

  return (
    <>
      {isLoading ? <Loader width="500px" height="250px" /> : null}
      <Layout>
        <div className="flex justify-between m-5 text-2xl text-center">
          Saved Mindmaps
        </div>

        {!mindmaps && (
          <div className="flex justify-center gap-2 mt-[8vh] text-2xl text-yellow-200">
            <span>Opps!! No Mindmaps Saved</span>
            <div className="p-1">
              <IoSaveOutline />
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3 m-4 justify-normal">
          {mindmaps?.data?.map((item, index) => {
            // console.log(item);
            return (
              <Card
                shadow="sm"
                key={index}
                isPressable
                onPress={() => console.log("item pressed")}
              >
                <CardBody className="p-0 overflow-visible">
                  <Image
                    shadow="sm"
                    radius="lg"
                    width="100%"
                    alt={item?.data.initialNodes[0].data.label}
                    className="w-full object-cover h-[140px]"
                    src={item?.img}
                  />
                </CardBody>
                <CardFooter className="flex justify-between gap-3">
                  <span className="text-xl">
                    {item?.data.initialNodes[0].data.label}
                  </span>
                  <Link to={`/mindmap/save/${item._id}`} state={item}>
                    <Button isIconOnly color="warning" variant="shadow">
                      <IoOpenOutline />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </Layout>
    </>
  );
};

export default SavedMindmaps;
