import {
  Flex,
  Heading,
  Input,
  Button,
  InputGroup,
  Stack,
  InputLeftElement,
  Box,
  FormControl,
} from "@chakra-ui/react";
import { NextPage } from "next";
import { auth } from "../../firebase";
import { SubmitHandler, useForm } from "react-hook-form";
import { signInWithEmailAndPassword } from "firebase/auth";

type Inputs = {
  email: string;
  password: string;
};

const Login: NextPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    signInWithEmailAndPassword(auth, data.email, data.password)
      .then((userCredential) => {
        userCredential.user;
      })
      .catch((error) => {
        alert("失敗しました");
        console.log(error.code);
        console.log(error.message);
      });
  };

  return (
    <Flex
      height="calc(100vh - 60px)"
      justifyContent="center"
      alignItems="center"
      flexDirection="column"
    >
      <Stack flexDir="column" justifyContent="center" alignItems="center">
        <Heading color="teal.400">Log in</Heading>
        <Box minW={{ base: "90%", md: "350px" }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack
              spacing={5}
              p={6}
              backgroundColor="whiteAlpha.900"
              boxShadow="md"
              rounded="5"
            >
              <FormControl>
                <InputGroup>
                  <InputLeftElement pointerEvents="none" />
                  <Input
                    type="email"
                    p="3"
                    placeholder="email address"
                    {...register("email", { required: true })}
                  />
                </InputGroup>
                {errors.email && (
                  <Box color="red" fontSize="sm">
                    ※emailを入力してください
                  </Box>
                )}
              </FormControl>
              <FormControl>
                <InputGroup>
                  <InputLeftElement pointerEvents="none" color="gray.300" />
                  <Input
                    type={"password"}
                    p="3"
                    placeholder="Password"
                    {...register("password", { required: true })}
                  />
                </InputGroup>
                {errors.password && (
                  <Box color="red" fontSize="sm">
                    ※passwordを入力してください
                  </Box>
                )}
              </FormControl>
              <Button
                borderRadius={0}
                type="submit"
                variant="solid"
                colorScheme="teal"
                width="full"
                rounded="5"
              >
                Login
              </Button>
            </Stack>
          </form>
        </Box>
      </Stack>
    </Flex>
  );
};

export default Login;
