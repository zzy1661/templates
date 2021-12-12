import React, { Suspense } from "react";
import { Routes, Route, HashRouter  } from "react-router-dom";
let HomePage = React.lazy(
	() => import("./containers/HomePage/HomePage")
);

export default class App extends React.Component {
	render() {
		return (
			<div>
				<Suspense fallback={<div>loading</div>}>
					<HashRouter>
						<Routes> <Route path="/" element={<HomePage></HomePage>}></Route></Routes>
					</HashRouter>
				</Suspense>
			</div>
		);
	}
}
